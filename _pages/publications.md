---
layout: page
permalink: /publications/
title: Publications
gradient_title: true
description: <i>To boldly go where no man has gone before.</i>
nav: true
nav_order: 2
---

<div class="publications">
  {% assign total_citations = site.data.scholar_citations.total_citations %}
  {% assign total_stars = site.data.github_stars.total_stars %}
  <div class="pub-stats" aria-label="Publication impact">
    {% if total_citations != null %}
      <a href="https://scholar.google.com/citations?user={{ site.scholar_userid }}">
        <strong>{{ total_citations }}</strong>
        <span>Citations</span>
      </a>
    {% endif %}
    {% if total_stars != null %}
      <a href="https://github.com/{{ site.github_username }}">
        <strong>{{ total_stars }}</strong>
        <span>GitHub stars</span>
      </a>
    {% endif %}
  </div>

{% include bib_search.liquid %}

{% bibliography %}

</div>
