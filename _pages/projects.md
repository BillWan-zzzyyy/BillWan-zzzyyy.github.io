---
layout: none
permalink: /projects/
title: Redirecting
nav: false
sitemap: false
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting…</title>
    <meta name="robots" content="noindex">
    <link rel="canonical" href="{{ '/research/' | absolute_url }}">
    <meta http-equiv="refresh" content="0; url={{ '/research/' | relative_url }}">
  </head>
  <body>
    <p>This page has moved to <a href="{{ '/research/' | relative_url }}">{{ '/research/' | absolute_url }}</a>.</p>
    <script>
      window.location.replace("{{ '/research/' | relative_url }}");
    </script>
  </body>
</html>
