---
layout: page
permalink: /publications/
title: Publications
description: <i>To boldly go where no man has gone before.</i>
nav: true
nav_order: 2
---

<div class="publications">
  <div class="stat-pill-row">
    {% if site.data.scholar_citations %}
      <a class="stat-pill" href="https://scholar.google.com/citations?user={{ site.scholar_userid }}" target="_blank" rel="noopener">
        <span class="stat-pill__label"><i class="ai ai-google-scholar"></i> Google Scholar</span>
        <span class="stat-pill__value">{{ site.data.scholar_citations.total_citations }}</span>
      </a>
    {% endif %}
    {% if site.data.github_stars %}
      <a class="stat-pill" href="https://github.com/{{ site.github_username }}" target="_blank" rel="noopener">
        <span class="stat-pill__label"><i class="fa-brands fa-github"></i> GitHub</span>
        <span class="stat-pill__value">{{ site.data.github_stars.total_stars }} ★</span>
      </a>
    {% endif %}
  </div>

  {% include bib_search.liquid %}

  {% bibliography %}
</div>
