<!-- ---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

{% if author.googlescholar %}
  You can also find my articles on <u><a href="https://scholar.google.com/citations?hl=en&user=RWGt9XQAAAAJ">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %} -->


---
layout: page
title: "Publications"
permalink: /publications/
author_profile: true
---

{% if author.googlescholar %}
  You can also find my articles on <u><a href="https://scholar.google.com/citations?hl=en&user=RWGt9XQAAAAJ">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

<h2>Publications</h2>

<ul>
  {% for publication in site.data.publications %}
    <li>
      {{ publication.title }}<br>
      {{ publication.authors }}<br>
      {{ publication.journal }}<br>
      {{ publication.year }}<br>
      [Link]({{ publication.link }})
    </li>
  {% endfor %}
</ul>


