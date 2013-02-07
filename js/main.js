r = new Renderer({canvas: document.getElementById('canvas')});

var $p1 = $($("p")[1]);
var $p2 = $p1.clone();
$p2.copyCSS($p1);
console.log($p2);
r.renderHTML($p2[0].outerHTML);