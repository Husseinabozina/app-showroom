import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  GitHubClient,
  validateCatalog,
  bytesBase64,
  newProject,
  REPOSITORY,
} from "../dist/admin/core.js";
const catalog = JSON.parse(readFileSync("content/projects.json", "utf8"));
assert.deepEqual(validateCatalog(catalog), []);
const privateLink = structuredClone(catalog);
privateLink
  .find((p) => p.source === "Private source")
  .links.push({
    label: "App code",
    url: "https://example.com/",
    kind: "source",
  });
assert(validateCatalog(privateLink).some((e) => e.includes("الكود الخاص")));
const invalid = structuredClone(catalog);
invalid[0].links[0].url = "javascript:alert(1)";
invalid[0].color = "red;display:none";
invalid[0].screens[0].src = "assets/../escape.webp";
assert(validateCatalog(invalid).length >= 3);
const duplicate = structuredClone(catalog);
duplicate.push(duplicate[0]);
assert(validateCatalog(duplicate).some((e) => e.includes("مستخدم")));
assert(
  validateCatalog([
    { ...newProject(), name: "Draft", slug: "draft", visible: false },
  ]).length === 0,
);
const uploads = new Map([
  ["dist/assets/test/screen-a.webp", { bytes: new Uint8Array([1, 2, 3]) }],
]);
assert.equal(bytesBase64(uploads.values().next().value.bytes), "AQID");
const requests = [];
let ref = "base",
  sha = "catalog-v1";
const transport = async (url, options) => {
  requests.push({ url, options });
  const path = new URL(url).pathname;
  let data;
  if (path.endsWith("/git/ref/heads/main")) data = { object: { sha: ref } };
  else if (path.endsWith("/git/commits/base"))
    data = { sha: "base", tree: { sha: "base-tree" } };
  else if (path.includes("/contents/content/projects.json"))
    data = {
      sha,
      content: Buffer.from(JSON.stringify(catalog)).toString("base64"),
    };
  else if (path.endsWith("/git/blobs")) data = { sha: "image-blob" };
  else if (path.endsWith("/git/trees")) {
    const body = JSON.parse(options.body);
    assert.equal(body.base_tree, "base-tree");
    assert(body.tree.some((t) => t.path === "content/projects.json"));
    assert(
      body.tree.some(
        (t) =>
          t.path === "dist/assets/test/screen-a.webp" && t.sha === "image-blob",
      ),
    );
    data = { sha: "new-tree" };
  } else if (path.endsWith("/git/commits")) {
    const body = JSON.parse(options.body);
    assert.deepEqual(body.parents, ["base"]);
    assert.equal(body.tree, "new-tree");
    data = { sha: "new-commit" };
  } else if (path.endsWith("/git/refs/heads/main")) {
    const body = JSON.parse(options.body);
    assert.equal(body.force, false);
    assert.equal(body.sha, "new-commit");
    ref = "new-commit";
    data = { object: { sha: ref } };
  } else throw Error("Unexpected path " + path);
  return { ok: true, status: 200, json: async () => data };
};
const client = new GitHubClient("test-session-token", transport);
const result = await client.publish(catalog, uploads, "catalog-v1");
assert.equal(result.sha, "new-commit");
assert.equal(ref, "new-commit");
assert(requests.every((r) => r.url.startsWith("https://api.github.com/")));
assert(
  requests.every(
    (r) => r.options.headers.Authorization === "Bearer test-session-token",
  ),
);
ref = "base";
sha = "changed-catalog";
requests.length = 0;
await assert.rejects(
  () => client.publish(catalog, uploads, "catalog-v1"),
  /الكتالوج اتغير/,
);
assert(
  requests.every((r) => r.options.method === "GET"),
  "Conflicting catalog must not write any objects",
);
client.disconnect();
requests.length = 0;
await client.load();
assert(
  requests.every((r) => !r.options.headers.Authorization),
  "Disconnect must clear the token",
);
const manager = readFileSync("dist/admin/manager.js", "utf8");
assert(!/localStorage|sessionStorage/.test(manager));
console.log(
  "PASS: atomic image/catalog publication, optimistic conflict rejection, source labels, upload paths, session-token clearing and unsafe-link validation.",
);
