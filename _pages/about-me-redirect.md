---
layout: none
permalink: /about-me/
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
    <link rel="canonical" href="{{ '/beyond/' | absolute_url }}">
    <meta http-equiv="refresh" content="0; url={{ '/beyond/' | relative_url }}">
  </head>
  <body>
    <p>This page has moved to <a href="{{ '/beyond/' | relative_url }}">{{ '/beyond/' | absolute_url }}</a>.</p>
    <script>
      window.location.replace("{{ '/beyond/' | relative_url }}");
    </script>
  </body>
</html>
