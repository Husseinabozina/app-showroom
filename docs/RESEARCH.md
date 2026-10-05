# Research and publication decisions

Reviewed October 6, 2026. Public GitHub readmes, public presentation pages and official store listings are the evidence basis. No private application code or credentials are published in this repository.

## Featured

| Product | Why featured | Evidence and boundary |
| --- | --- | --- |
| NOVA | Strong real captures, walkthrough video, connected commerce and inspectable engineering | `fashion_e_commerce`; sample content and sandbox/demo orders, not production commerce |
| Brees | Connected finance journeys, architecture, documented visual QA and CI | `Brees-Mobile-App`; independent implementation of a credited Figma Community UI kit |
| OverDeal | Published client product with a specifically documented contribution | `overdeal-view` plus Google Play `com.app.overdeal`; original Flutter delivery only; later work belongs to another team |
| HealthTrack | Reusable screen system, navigation regression coverage and clear data boundaries | `medical_app`; credited Figma Community UI kit; deterministic local session adapter |

## Canonical projects

- NOVA = `fashion_e_commerce`.
- HealthTrack = `medical_app`.
- Brees = `Brees-Mobile-App`.
- Madow = `madow`, `madow-view`, and supporting `madwo_assets`; the public page explicitly says demo and does not claim live services or payment processing.
- Qurani = `muslim`, `muslim_view`, `muslim-app-showcase`; APK verified in `muslim-app-showcase` release v1.0.0. Do not use the inactive APK UI in `muslim_view` as download evidence.
- Messaging platform = `chat_app`; the September 30 checkpoint explicitly defers custom mobile REST/realtime integration and final product UI. It is not a shipped realtime platform.
- Jabha Maak / Talabiat: `jabhamaeak-app` links Google Play package `com.efadh.talabiat`. Its store listing has also been titled Talabiat. Treat as a probable rename/alias group pending owner confirmation, not two independent apps.
- OverDeal is **separate** from Jabha Maak: different product, description and Android package.
- Themar, Nibbles, Beauty & More have similar/duplicate repository names; grouping requires owner confirmation before publication.

## Not ready for full case studies

| Project | What is still needed |
| --- | --- |
| Lamsa Latifa | Exact personal contribution, company/client context and which releases/features belong to Hussein. Public store artwork and links have already been found. |
| Jabha Maak / Talabiat | Confirm preferred product name and rename relationship, exact mobile contribution, releases and team context. Store images and links already found. |
| Kesaa, Rawnq | Approved product summary, personal role, representative screenshots and public proof/demo links. |
| Beauty & More | Canonical repository and product naming, personal contribution, approved screenshots and current store links. |
| Themar, Nibbles | Resolve repository duplicates, confirm current project state, scope, media and shareable build. |
| Other non-GitHub work | A project name, permitted description, role, status and 3–6 screenshots are enough to start a record. |

Madow would benefit from a shareable APK/video. Qurani would benefit from more specific contribution and engineering notes. Messaging can receive a product gallery once the new interface is implemented and captured.

## Asset provenance

Real app captures were copied from public repositories and resized/encoded as WebP without UI alteration:

- NOVA: `fashion_e_commerce/site/assets/screens/` (owner-supplied simulator captures); walkthrough uses the existing public recording.
- Brees: `Brees-Mobile-App/screenshots/` (Flutter runtime captures).
- HealthTrack: `medical_app/docs/assets/app-screens/` (project-published previews).
- Madow: `madow-view/assets/screenshots/` (unframed app captures).
- Qurani: `muslim-app-showcase/screenshots/`.
- OverDeal, Lamsa Latifa and Jabha Maak: official Google Play listing images. OverDeal's visible images are expressly labeled store artwork; they may show work added after the original delivery.

Store image source URLs are recorded in `docs/store-assets.json`. Unpublished Lamsa/Jabha assets are retained for future editing but not displayed. Assets remain the property of their respective owners. Source-code visibility does not grant a license to redistribute third-party artwork separately.

Manrope is self-hosted under the SIL Open Font License; see `dist/assets/fonts/OFL.txt`. The showroom identity/layout is original and does not reproduce existing presentation-site layouts.
