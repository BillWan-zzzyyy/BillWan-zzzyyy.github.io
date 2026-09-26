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
  {% assign this_year = site.time | date: '%Y' %}
  {% assign cites_this_year = cites_per_year[this_year] %}
  {% assign first_cite_year = null %}
  {% for year_cites in cites_per_year %}
    {% assign first_cite_year = year_cites[0] %}
    {% break %}
  {% endfor %}
  {% assign star_repos = site.data.github_stars.repos %}
  {% assign star_repo_count = star_repos | size %}
  {% assign top_repo = null %}
  {% assign top_repo_stars = 0 %}
  {% for repo_stars in star_repos %}
    {% if repo_stars[1] > top_repo_stars %}
      {% assign top_repo = repo_stars[0] %}
      {% assign top_repo_stars = repo_stars[1] %}
    {% endif %}
  {% endfor %}
  {% if total_citations != null or total_stars != null %}
    <div class="growth-cards" role="group" aria-label="Publication impact">
      {% if total_citations != null %}
        <div class="growth-card" data-reveal>
          <a class="growth-card__inner" href="https://scholar.google.com/citations?user={{ site.scholar_userid }}">
            <span class="growth-card__label"><i class="ai ai-google-scholar" aria-hidden="true"></i>Citations</span>
            <strong class="growth-card__value">{{ total_citations }}</strong>
            {% if cites_this_year > 0 or first_cite_year != null %}
              <div class="growth-card__facts">
                {% if cites_this_year > 0 %}
                  <span>+{{ cites_this_year }} in {{ this_year }}</span>
                {% endif %}
                {% if first_cite_year != null %}
                  <span>since {{ first_cite_year }}</span>
                {% endif %}
              </div>
            {% endif %}
          </a>
        </div>
      {% endif %}
      {% if total_stars != null %}
        <div class="growth-card" data-reveal style="--reveal-delay: 90ms">
          <a class="growth-card__inner" href="https://github.com/{{ site.github_username }}">
            <span class="growth-card__label"><i class="fa-brands fa-github" aria-hidden="true"></i>GitHub stars</span>
            <strong class="growth-card__value">{{ total_stars }}</strong>
            {% if star_repo_count > 0 %}
              <div class="growth-card__facts">
                <span>across {{ star_repo_count }} {% if star_repo_count == 1 %}repository{% else %}repositories{% endif %}</span>
                {% if top_repo != null %}
                  <span>top: {{ top_repo | split: '/' | last }} ★ {{ top_repo_stars }}</span>
                {% endif %}
              </div>
            {% endif %}
          </a>
        </div>
      {% endif %}
    </div>
  {% endif %}

{% bibliography %}

</div>
