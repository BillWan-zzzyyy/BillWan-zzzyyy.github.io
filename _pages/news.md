---
layout: page
title: News
permalink: /news/
description: <i>Recent updates and milestones.</i>
---

<div class="news news-archive">
  {% if site.news != blank %}
    {% assign news_reversed = site.news | sort: "date" | reverse %}
    {% assign grouped = news_reversed | group_by_exp: "item", "item.date | date: '%Y'" %}
    {% for year_group in grouped %}
      <h2 class="news-year">{{ year_group.name }}</h2>
      <ol class="news-list">
        {% for item in year_group.items %}
          <li class="news-row">
            <time class="news-date" datetime="{{ item.date | date_to_xmlschema }}">
              {{- item.date | date: '%b %d' -}}
            </time>
            <div class="news-body">
              {% if item.inline %}
                {{ item.content | remove: '<p>' | remove: '</p>' | emojify }}
              {% else %}
                <a class="news-title" href="{{ item.url | relative_url }}">{{ item.title }}</a>
              {% endif %}
            </div>
          </li>
        {% endfor %}
      </ol>
    {% endfor %}
  {% else %}
    <p>No news so far...</p>
  {% endif %}
</div>
