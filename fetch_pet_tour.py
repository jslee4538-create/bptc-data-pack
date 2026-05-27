import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = "a685f2989bae281c3696172d4cc2554e39106d51910cf624d74f63686e064e8e"
BASE = "https://apis.data.go.kr/B551011/KorService2"

CONTENT_TYPES = {
    "12": "관광지", "14": "문화시설", "15": "축제/행사",
    "28": "레포츠", "32": "숙박", "38": "쇼핑", "39": "음식점"
}

def fetch_all_busan(content_type_id, page_size=100):
    items = []
    page = 1
    while True:
        try:
            resp = requests.get(f"{BASE}/areaBasedList2", params={
                "serviceKey": API_KEY, "numOfRows": page_size, "pageNo": page,
                "MobileOS": "ETC", "MobileApp": "PetTourBusan",
                "_type": "json", "areaCode": "6", "contentTypeId": content_type_id
            }, timeout=15)
            data = resp.json()
            body = data["response"]["body"]
            page_items = body["items"]
            if isinstance(page_items, dict):
                page_items = page_items.get("item", [])
            else:
                break
            items.extend(page_items)
            if len(items) >= body["totalCount"]:
                break
            page += 1
        except Exception:
            break
    return items

def check_pet(spot):
    cid = spot["contentid"]
    try:
        resp = requests.get(f"{BASE}/detailPetTour2", params={
            "serviceKey": API_KEY, "numOfRows": 10, "pageNo": 1,
            "MobileOS": "ETC", "MobileApp": "PetTourBusan",
            "_type": "json", "contentId": cid
        }, timeout=15)
        if not resp.text.strip():
            return None
        data = resp.json()
        body = data["response"]["body"]
        items = body["items"]
        if isinstance(items, dict) and items.get("item"):
            pet_items = items["item"]
            return {
                "title": spot["title"],
                "addr": spot.get("addr1", ""),
                "type": spot["_type_name"],
                "contentTypeId": spot["contenttypeid"],
                "contentId": cid,
                "mapx": float(spot.get("mapx", 0) or 0),
                "mapy": float(spot.get("mapy", 0) or 0),
                "image": spot.get("firstimage", ""),
                "pet_info": pet_items[0] if isinstance(pet_items, list) else pet_items
            }
    except Exception:
        pass
    return None

def check_chkpet(spot):
    cid = spot["contentid"]
    try:
        resp = requests.get(f"{BASE}/detailIntro2", params={
            "serviceKey": API_KEY, "numOfRows": 1, "pageNo": 1,
            "MobileOS": "ETC", "MobileApp": "PetTourBusan",
            "_type": "json", "contentId": cid, "contentTypeId": "12"
        }, timeout=15)
        if not resp.text.strip():
            return None
        data = resp.json()
        body = data["response"]["body"]
        items = body["items"]
        if isinstance(items, dict) and items.get("item"):
            intro = items["item"]
            if isinstance(intro, list):
                intro = intro[0]
            chkpet = intro.get("chkpet", "")
            if chkpet and "불가" not in chkpet and chkpet.strip():
                return {
                    "title": spot["title"],
                    "addr": spot.get("addr1", ""),
                    "type": "관광지",
                    "contentTypeId": "12",
                    "contentId": cid,
                    "mapx": float(spot.get("mapx", 0) or 0),
                    "mapy": float(spot.get("mapy", 0) or 0),
                    "image": spot.get("firstimage", ""),
                    "pet_info": {"chkpet": chkpet}
                }
    except Exception:
        pass
    return None

print("=" * 60)
print("부산 반려동물 동반 관광 데이터 수집 (병렬 처리)")
print("=" * 60)

all_spots = []
for ct_id, ct_name in CONTENT_TYPES.items():
    spots = fetch_all_busan(ct_id)
    print(f"[{ct_name}] {len(spots)}건 수집")
    for s in spots:
        s["_type_name"] = ct_name
    all_spots.extend(spots)

print(f"\n총 {len(all_spots)}건. 병렬 반려동물 정보 조회 시작 (20 threads)...")

pet_friendly = []
done = 0

with ThreadPoolExecutor(max_workers=20) as executor:
    futures = {executor.submit(check_pet, spot): spot for spot in all_spots}
    for future in as_completed(futures):
        done += 1
        result = future.result()
        if result:
            pet_friendly.append(result)
            print(f"  [PET OK] {result['title']} ({result['type']})")
        if done % 100 == 0:
            print(f"  ... {done}/{len(all_spots)} 완료 (펫 가능: {len(pet_friendly)}건)")

print(f"\ndetailPetTour2 결과: {len(pet_friendly)}건")

# 관광지 chkpet 추가 확인
tourism_spots = [s for s in all_spots if s["_type_name"] == "관광지"]
pet_ids = {p["contentId"] for p in pet_friendly}
tourism_to_check = [s for s in tourism_spots if s["contentid"] not in pet_ids]

print(f"관광지 chkpet 추가 확인: {len(tourism_to_check)}건 (병렬)...")

with ThreadPoolExecutor(max_workers=20) as executor:
    futures = {executor.submit(check_chkpet, spot): spot for spot in tourism_to_check}
    for future in as_completed(futures):
        result = future.result()
        if result:
            pet_friendly.append(result)
            print(f"  [chkpet] {result['title']}: {result['pet_info'].get('chkpet','')[:50]}")

print(f"\n최종 반려동물 동반 가능: {len(pet_friendly)}건")

with open("/mnt/c/Users/user/bptc-data-pack-main/pet_tour_data.json", "w", encoding="utf-8") as f:
    json.dump(pet_friendly, f, ensure_ascii=False, indent=2)

print("pet_tour_data.json 저장 완료!")
