# Maven Builders — website

Static site. No frameworks, no npm installs — just Node.js (any recent version).

## Build

```
node build.js
```

Assembles the pages and copies assets into `public/`. Everything a webserver
needs is in that folder — deploy it as-is.

## Run locally

```
node build.js && node serve.js
```

Then open http://localhost:8080. The dev server also fakes the contact-form
endpoint (`POST /api/contact`) and logs submissions to the console.

## Folder structure

```
site/
├── build.js              # build script (zero dependencies)
├── serve.js              # local dev server (zero dependencies)
├── content/
│   ├── testimonials.json # ← edit this to add/change testimonials
│   └── photos/           # ← drop testimonial photos here
├── src/
│   ├── layout.html       # shared header/footer wrapper
│   ├── pages/            # one file per page (index, about, testimonials, contact)
│   ├── css/styles.css    # the one stylesheet
│   ├── assets/           # logo, favicon
│   └── images/           # your site photos (hero, team, etc.)
└── public/               # ← BUILT OUTPUT (never edit by hand)
```

## Adding a testimonial

1. Drop the photo (e.g. `smith.jpg`) into `content/photos/`.
2. Add an entry to `content/testimonials.json`:

```json
{
  "quote": "What they said.",
  "name": "The Smith Family",
  "detail": "Craftsman 3-bed build",
  "photo": "smith.jpg"
}
```

Leave `"photo": ""` to show initials instead. `detail` is optional too.

3. Rebuild: `node build.js`.

Each testimonial also gets its own page (`testimonial-<name>.html`) with a
photo gallery. To add build photos to it, drop the files in `content/photos/`
and list them in the entry's `images` array — plain filenames, or objects
with a caption:

```json
"images": [
  "smith-kitchen.jpg",
  { "src": "smith-porch.jpg", "caption": "The wraparound porch" }
]
```

## Replacing photo placeholders

The hero and about pages ship with placeholder boxes. Put your photo in
`src/images/` and swap the placeholder `<div class="ph">…</div>` for the
`<img>` tag shown in the comment right above it. Rebuild.

## Contact form

The form POSTs `name`, `phone`, `email`, `message` as
`application/x-www-form-urlencoded` to **`/api/contact`**. To point it at your
real endpoint, change the `action` attribute in `src/pages/contact.html`
(one place). A 2xx response shows the success message.
