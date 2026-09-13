---
layout: page
permalink: /publications/
title: Publications
description: Publications in autonomous driving and intelligent transportation.
nav: true
nav_order: 2
---

<div class="publications">
  <p class="pub-stats">
    {% if site.data.scholar_citations %}<a href="https://scholar.google.com/citations?user={{ site.scholar_userid }}">{{ site.data.scholar_citations.total_citations }} citations</a> on Google Scholar{% endif %}{% if site.data.github_stars %} · <a href="https://github.com/{{ site.github_username }}">{{ site.data.github_stars.total_stars }} stars</a> on GitHub{% endif %}
  </p>

{% include bib_search.liquid %}

{% bibliography %}

</div>
