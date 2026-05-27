import json
import html as html_mod

with open("/mnt/c/Users/user/bptc-data-pack-main/pet_tour_data.json", "r", encoding="utf-8") as f:
    spots = json.load(f)

valid = [s for s in spots if s["mapx"] and s["mapy"]]
busan = [s for s in valid if s["is_busan"]]
others = [s for s in valid if not s["is_busan"]]
print(f"전체 {len(valid)}건 (부산 {len(busan)}, 전국 {len(others)})")

type_config = {
    "관광지":    {"color": "#10b981", "icon": "fa-tree",       "emoji": "🌳"},
    "문화시설":  {"color": "#8b5cf6", "icon": "fa-landmark",   "emoji": "🏛"},
    "축제/행사": {"color": "#ef4444", "icon": "fa-calendar",   "emoji": "🎉"},
    "레포츠":    {"color": "#f59e0b", "icon": "fa-person-biking","emoji": "🚴"},
    "숙박":      {"color": "#3b82f6", "icon": "fa-bed",        "emoji": "🏨"},
    "쇼핑":      {"color": "#ec4899", "icon": "fa-bag-shopping","emoji": "🛍"},
    "음식점":    {"color": "#f97316", "icon": "fa-utensils",   "emoji": "🍽"},
}

markers_data = []
for s in valid:
    tc = type_config.get(s["type"], {"color": "#6b7280", "icon": "fa-map-pin", "emoji": "📍"})
    title = html_mod.escape(s["title"])
    addr = html_mod.escape(s.get("addr", ""))
    tel = html_mod.escape(s.get("tel", ""))
    type_name = html_mod.escape(s["type"])
    img = s.get("image", "")
    is_busan = s.get("is_busan", False)

    homepage = s.get("homepage", "")

    markers_data.append({
        "lat": s["mapy"], "lng": s["mapx"],
        "title": title, "addr": addr, "tel": tel,
        "type": type_name, "color": tc["color"],
        "icon": tc["icon"], "emoji": tc["emoji"],
        "img": img, "busan": is_busan,
        "homepage": homepage
    })

markers_json = json.dumps(markers_data, ensure_ascii=False)

from collections import Counter
type_counts = Counter(s["type"] for s in valid)
region_counts = Counter()
for s in valid:
    addr = s.get("addr", "")
    if addr:
        region_counts[addr.split()[0]] += 1

legend_html = ""
for tname, tc in type_config.items():
    cnt = type_counts.get(tname, 0)
    if cnt > 0:
        legend_html += f'<label class="legend-item"><input type="checkbox" checked data-type="{tname}"><span class="dot" style="background:{tc["color"]}"></span>{tname} ({cnt})</label>'

region_options = ""
for r, c in region_counts.most_common():
    region_options += f'<option value="{r}">{r} ({c})</option>'

html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>반려동물 동반 여행 지도</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Pretendard',-apple-system,'Noto Sans KR',sans-serif}}
#map{{width:100%;height:100vh}}

.header{{
  position:fixed;top:0;left:0;right:0;z-index:1000;
  background:linear-gradient(135deg,#7c3aed,#2563eb);
  color:#fff;padding:14px 20px;
  display:flex;align-items:center;justify-content:space-between;
  box-shadow:0 4px 20px rgba(0,0,0,.25);
}}
.header h1{{font-size:20px;font-weight:800;letter-spacing:-0.5px}}
.header h1 span{{font-size:24px;margin-right:6px}}
.header-badges{{display:flex;gap:8px}}
.badge{{background:rgba(255,255,255,.18);padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600;backdrop-filter:blur(4px)}}
.badge.busan{{background:rgba(255,200,50,.3)}}

.panel{{
  position:fixed;top:70px;left:16px;z-index:1000;
  background:#fff;border-radius:16px;padding:18px;
  box-shadow:0 8px 32px rgba(0,0,0,.12);
  width:220px;font-size:13px;
  max-height:calc(100vh - 100px);overflow-y:auto;
}}
.panel h3{{font-size:15px;font-weight:700;margin-bottom:12px;color:#1e1b4b}}
.panel hr{{border:none;border-top:1px solid #e5e7eb;margin:12px 0}}

.legend-item{{
  display:flex;align-items:center;gap:8px;cursor:pointer;
  padding:4px 0;user-select:none;
}}
.legend-item input{{accent-color:#7c3aed;width:15px;height:15px}}
.dot{{width:12px;height:12px;border-radius:50%;flex-shrink:0}}

select{{
  width:100%;padding:8px 10px;border:1.5px solid #e5e7eb;border-radius:10px;
  font-size:13px;margin-top:6px;background:#f9fafb;
  font-family:inherit;
}}

.btn{{
  width:100%;padding:9px;border:none;border-radius:10px;
  font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;
  font-family:inherit;transition:all .15s;
}}
.btn-busan{{background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff}}
.btn-busan:hover{{opacity:.85}}
.btn-all{{background:#f3f4f6;color:#374151}}
.btn-all:hover{{background:#e5e7eb}}

.info-box{{
  position:fixed;bottom:20px;right:16px;z-index:1000;
  background:#fff;padding:14px 18px;border-radius:14px;
  box-shadow:0 6px 24px rgba(0,0,0,.1);font-size:12px;
  color:#6b7280;max-width:240px;line-height:1.6;
}}
.info-box a{{color:#7c3aed;text-decoration:none;font-weight:600}}

.marker-icon{{
  width:36px;height:36px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.3);
  font-size:15px;color:#fff;transition:transform .15s;
}}
.marker-icon:hover{{transform:scale(1.2)}}
.marker-icon.busan-marker{{border-color:#fbbf24;box-shadow:0 0 0 2px #fbbf24,0 3px 8px rgba(0,0,0,.3)}}

.leaflet-popup-content-wrapper{{border-radius:14px!important;box-shadow:0 8px 30px rgba(0,0,0,.15)!important}}
.leaflet-popup-content{{margin:0!important;padding:0!important;width:280px!important}}
.popup-card img{{width:100%;height:160px;object-fit:cover;border-radius:14px 14px 0 0}}
.popup-card .body{{padding:14px}}
.popup-card h3{{font-size:16px;font-weight:700;color:#1e1b4b;margin-bottom:6px}}
.popup-card .type-badge{{
  display:inline-block;padding:3px 10px;border-radius:8px;
  font-size:11px;font-weight:600;color:#fff;margin-bottom:8px;
}}
.popup-card .addr{{font-size:12px;color:#6b7280;margin-bottom:4px}}
.popup-card .tel{{font-size:12px;color:#7c3aed;font-weight:500}}
.popup-card .site-link{{
  display:block;margin-top:10px;padding:8px 12px;
  background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;
  border-radius:8px;text-decoration:none;font-size:12px;font-weight:600;
  text-align:center;transition:opacity .15s;
}}
.popup-card .site-link:hover{{opacity:.85}}
.popup-card .busan-tag{{
  display:inline-block;background:#fef3c7;color:#92400e;
  padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;margin-left:6px;
}}
</style>
</head>
<body>

<div class="header">
  <h1><span>🐾</span>반려동물 동반 여행 지도</h1>
  <div class="header-badges">
    <span class="badge busan">부산 {len(busan)}곳</span>
    <span class="badge">전국 {len(valid)}곳</span>
  </div>
</div>

<div class="panel">
  <h3>카테고리 필터</h3>
  {legend_html}
  <hr>
  <h3>지역 필터</h3>
  <select id="regionFilter">
    <option value="">전체 지역</option>
    {region_options}
  </select>
  <hr>
  <button class="btn btn-busan" onclick="goToBusan()">📍 부산 보기</button>
  <button class="btn btn-all" onclick="goToAll()">🗺 전국 보기</button>
</div>

<div class="info-box">
  <strong>사용법</strong><br>
  마커를 클릭하면 상세 정보를 볼 수 있습니다.<br>
  카테고리/지역으로 필터링할 수 있습니다.<br>
  <span style="color:#fbbf24">●</span> 금색 테두리 = 부산 장소<br><br>
  데이터: <a href="https://api.visitkorea.or.kr" target="_blank">한국관광공사 TourAPI</a>
</div>

<div id="map"></div>

<script>
var spots = {markers_json};

var map = L.map('map',{{zoomControl:false}}).setView([36.5,127.8],7);
L.control.zoom({{position:'bottomleft'}}).addTo(map);

L.tileLayer('https://{{s}}.basemaps.cartocdn.com/light_all/{{z}}/{{x}}/{{y}}@2x.png',{{
  attribution:'&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://osm.org">OSM</a>',
  maxZoom:19
}}).addTo(map);

var cluster = L.markerClusterGroup({{
  maxClusterRadius:50,
  spiderfyOnMaxZoom:true,
  showCoverageOnHover:false,
  iconCreateFunction:function(c){{
    var n=c.getChildCount();
    var sz=n<10?'small':n<30?'medium':'large';
    return L.divIcon({{
      html:'<div style="background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.3)">'+n+'</div>',
      iconSize:[40,40],className:''
    }});
  }}
}});

var allMarkers=[];

spots.forEach(function(s){{
  var cls='marker-icon'+(s.busan?' busan-marker':'');
  var icon=L.divIcon({{
    html:'<div class="'+cls+'" style="background:'+s.color+'"><i class="fas '+s.icon+'"></i></div>',
    iconSize:[36,36],iconAnchor:[18,18],popupAnchor:[0,-18],className:''
  }});

  var imgHtml=s.img?'<img src="'+s.img+'" onerror="this.style.display=\\'none\\'">':'';
  var busanTag=s.busan?'<span class="busan-tag">부산</span>':'';
  var telHtml=s.tel?'<div class="tel">📞 '+s.tel+'</div>':'';
  var linkHtml=s.homepage?'<a href="'+s.homepage+'" target="_blank" class="site-link">🔗 홈페이지 바로가기</a>':'';

  var popup='<div class="popup-card">'
    +imgHtml
    +'<div class="body">'
    +'<h3>'+s.emoji+' '+s.title+busanTag+'</h3>'
    +'<span class="type-badge" style="background:'+s.color+'">'+s.type+'</span>'
    +'<div class="addr">'+s.addr+'</div>'
    +telHtml
    +linkHtml
    +'</div></div>';

  var marker=L.marker([s.lat,s.lng],{{icon:icon}}).bindPopup(popup);
  marker._petData=s;
  cluster.addLayer(marker);
  allMarkers.push(marker);
}});

map.addLayer(cluster);

function filterMarkers(){{
  var checks=document.querySelectorAll('.legend-item input');
  var activeTypes=new Set();
  checks.forEach(function(c){{if(c.checked)activeTypes.add(c.dataset.type)}});
  var region=document.getElementById('regionFilter').value;

  cluster.clearLayers();
  allMarkers.forEach(function(m){{
    var d=m._petData;
    var typeOk=activeTypes.has(d.type);
    var regionOk=!region||d.addr.startsWith(region);
    if(typeOk&&regionOk) cluster.addLayer(m);
  }});
}}

document.querySelectorAll('.legend-item input').forEach(function(c){{
  c.addEventListener('change',filterMarkers);
}});
document.getElementById('regionFilter').addEventListener('change',filterMarkers);

function goToBusan(){{
  map.setView([35.15,129.05],12);
  document.getElementById('regionFilter').value='부산광역시';
  filterMarkers();
}}
function goToAll(){{
  map.setView([36.5,127.8],7);
  document.getElementById('regionFilter').value='';
  filterMarkers();
}}
</script>
</body>
</html>"""

with open("/mnt/c/Users/user/bptc-data-pack-main/busan_pet_tour_map.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"busan_pet_tour_map.html 생성 완료! ({len(valid)}곳)")
