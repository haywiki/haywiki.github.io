
{% capture layers %}{% if include.layers %}&datalayers={{ include.layers }}{%endif%}{% if include.location %}#{{ include.location }}{%endif%}{% endcapture %}

<iframe width="100%" height="{% if include.height %}{{include.height}}{% else %}450px{%endif%}" frameborder="0" allowfullscreen src="//umap.openstreetmap.fr/ru/map/map_826834?scaleControl=false&miniMap=false&scrollWheelZoom=false&zoomControl=true&allowEdit=false&moreControl=false&searchControl=null&tilelayersControl=null&embedControl=null&datalayersControl=true&onLoadPanel=none&captionBar=false{{ layers }}"></iframe>

{% if include.layers %}
[Открыть полную версию карты](/animals/map.html)
{%endif%}

