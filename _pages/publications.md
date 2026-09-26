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
  {% assign cites_per_year = site.data.scholar_citations.cites_per_year %}
  {% assign stars_history = site.data.github_stars.history %}
  {% if total_citations != null or total_stars != null %}
    <div class="growth-cards" role="group" aria-label="Publication impact">
      {% if total_citations != null %}
        <div class="growth-card" data-reveal>
          <a class="growth-card__inner" href="https://scholar.google.com/citations?user={{ site.scholar_userid }}">
            <span class="growth-card__label">Citations</span>
            <strong class="growth-card__value">{{ total_citations }}</strong>
            {% if cites_per_year %}
              <svg class="growth-card__chart" data-series="citations" aria-hidden="true"></svg>
              <div class="growth-card__axis" aria-hidden="true"><span></span><span></span></div>
            {% endif %}
          </a>
        </div>
      {% endif %}
      {% if total_stars != null %}
        <div class="growth-card" data-reveal style="--reveal-delay: 90ms">
          <a class="growth-card__inner" href="https://github.com/{{ site.github_username }}">
            <span class="growth-card__label">GitHub stars</span>
            <strong class="growth-card__value">{{ total_stars }}</strong>
            {% if stars_history %}
              <svg class="growth-card__chart" data-series="stars" aria-hidden="true"></svg>
              <div class="growth-card__axis" aria-hidden="true"><span></span><span></span></div>
            {% endif %}
          </a>
        </div>
      {% endif %}
    </div>
    <script type="application/json" id="growth-data">
      {"citations": {{ cites_per_year | jsonify }}, "citationsTotal": {{ total_citations | jsonify }}, "stars": {{ stars_history | jsonify }}, "starsTotal": {{ total_stars | jsonify }}}
    </script>
    <script defer src="{{ '/assets/js/growth-charts.js' | relative_url | bust_file_cache }}"></script>
  {% endif %}

{% bibliography %}

</div>
