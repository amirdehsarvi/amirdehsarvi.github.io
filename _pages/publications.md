---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
googlescholar: "https://scholar.google.com/citations?hl=en&user=RWGt9XQAAAAJ"
---

{% if author.googlescholar %}
  You can also find my articles on <u><a href="https://scholar.google.com/citations?hl=en&user=RWGt9XQAAAAJ">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}
