# 비주얼 에셋

## 황혼 성소 전장

- 생성 배경: `assets/generated/maps/twilight-sanctum/twilight-sanctum-board.png`
- Phaser preload: `src/game/phaser/scenes/BattleScene.ts`
- 보드 레이어 적용: `src/game/phaser/objects/BoardGrid.ts`

황혼 성소는 달빛이 비치는 보랏빛 룬석 전장이다. 중앙 전투면은 유닛과 배치 정보를 읽기 쉽게 비워 두고, 가장자리에 폐허 기둥, 촛불, 절벽, 청록빛 성소 등을 배치했다. 배치 단계에서는 칸 안내선이 은은하게 표시되며 전투 중에는 거의 사라져 전장 배경이 중심이 된다.

## 강철숲 방벽병 스프라이트

- 생성 에셋 번들: `assets/generated/ironwood-bulwark/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 벤치 카드와 드래그 미리보기: `src/components/bench/BenchSlot.tsx`, `src/game/phaser/PhaserGame.tsx`
- 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

강철숲 방벽병은 4프레임 idle 시트와 6프레임 방패·둔기 공격 시트를 사용한다. 철목 갑옷, 이끼 낀 어깨 장갑, 거대한 뿌리 문양 방패, 가슴의 비취 심재로 불씨 수호병과 구분한다. 스킬 `뿌리의 포효`는 자신과 주변 아군에게 뿌리와 비취 방벽이 솟아나는 4프레임 보호막 이펙트를 재생한다.

## 숲의 신비술사 스프라이트

- 생성 에셋 번들: `assets/generated/grove-mystic/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 기본공격과 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

숲의 신비술사는 4프레임 idle 시트와 6프레임 시전 시트를 사용한다. 기본공격은 초록빛 씨앗탄을 발사하며, 스킬 `초록 파동`은 모든 회복 대상 발밑에 잎사귀 룬이 피어나는 4프레임 이펙트를 재생한다.

## 폭풍 사수 스프라이트

## 천상 현자 스프라이트

- 생성 에셋 번들: `assets/generated/celestial-sage/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 기본공격과 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

천상 현자는 4프레임 idle 시트와 6프레임 별자리 시전 시트를 사용한다. 기본공격은 푸른 별빛탄을 발사하며, 스킬 `별똥별`은 범위 피해 대상에게 별자리 문양과 유성 낙하가 이어지는 4프레임 이펙트를 재생한다.

## 새벽 파수꾼 스프라이트

- 생성 에셋 번들: `assets/generated/dawn-warden/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 기본공격과 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

새벽 파수꾼은 4프레임 idle 시트와 6프레임 태양 방패 타격 시트를 사용한다. 기본공격은 대상에게 황금 방패 충격 이펙트를 재생하며, 스킬 `찬란한 방벽`은 모든 아군에게 태양 문양과 반투명 황금 방벽이 솟아나는 4프레임 보호막 이펙트를 재생한다.

- 생성 에셋 번들: `assets/generated/storm-ranger/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 기본공격과 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

폭풍 사수는 4프레임 idle 시트와 6프레임 활 공격 시트를 사용한다. 기본공격은 푸른 번개 화살을 발사하며, 스킬 `질풍 연사`는 시전자 주변에 전기 바람이 감도는 4프레임 이펙트를 재생한다.

## 천둥 난투가 스프라이트

- 생성 에셋 번들: `assets/generated/thunder-bruiser/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 기본공격과 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

천둥 난투가는 4프레임 idle 시트와 6프레임 건틀릿 펀치 시트를 사용한다. 기본공격 적중 시 대상에게 작은 전기 주먹 폭발이 재생되고, 스킬 `천둥 박수`는 범위 피해 대상의 발밑에 넓은 번개 충격파가 퍼지는 4프레임 이펙트를 재생한다.

## 그림자 추적자 스프라이트

- 생성 에셋: `assets/generated/shade-stalker/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 벤치 카드와 드래그 미리보기: `src/components/bench/BenchSlot.tsx`, `src/game/phaser/PhaserGame.tsx`
- 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

그림자 추적자는 4프레임 아이들, 6프레임 쌍단검 공격 시트를 사용한다. 스킬 `그림자 돌진`은 대상 위치에서 그림자 궤적과 교차 베기 스프라이트 시트를 재생한다.

## 밤의 예언자 스프라이트

- 생성 에셋 번들: `assets/generated/night-oracle/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 벤치 카드와 드래그 미리보기: `src/components/bench/BenchSlot.tsx`, `src/game/phaser/PhaserGame.tsx`
- 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

밤의 예언자는 4프레임 idle 시트와 6프레임 시전 시트를 사용한다. 인디고 후드 망토, 은색 초승달 지팡이, 보랏빛 눈빛으로 빙하 마법사와 구분한다. 기본공격은 공용 투사체 대신 보랏빛 초승달과 어두운 코어로 된 4프레임 `moon-bolt` 시트를 발사한다. 스킬 `황혼 치유`는 체력이 가장 낮은 아군 발밑에 초승달 룬과 별빛 문양이 피어나는 전용 4프레임 스프라이트 시트로 표현한다.

## 빙하 마법사 스프라이트

- 생성 에셋: `assets/generated/glacier-mage/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 벤치 카드와 드래그 미리보기: `src/components/bench/BenchSlot.tsx`, `src/game/phaser/PhaserGame.tsx`
- 스킬 이펙트: `src/game/phaser/objects/BoardGrid.ts`

빙하 마법사는 4프레임 아이들 시트와 6프레임 시전 시트를 사용한다. 두 시트의 프레임은 모두 128x128이며, 투명 배경과 동일한 발 위치 기준으로 가공했다. 스킬 `얼음 개화`는 시전자 주변의 수정 마법진, 대상 칸의 얼음꽃 파동과 파편 확산으로 표현한다.

`assets/generated/glacier-mage/ice-bloom/`에는 얼음 개화 전용 4프레임 스프라이트 시트가 있다. 룬이 나타난 뒤 결정 꽃이 피고 파편으로 사라지며, Phaser에서 대상 칸 중심으로 재생한다.

`assets/generated/glacier-mage/frost-bolt/`에는 빙하 마법사의 기본 공격용 4프레임 냉기탄 시트가 있다. 다이아형 수정 코어와 짧은 서리 꼬리가 있는 투사체로, 일반 투사체 대신 대상까지 이동하며 재생한다.

## 불씨 수호병 스프라이트

- 생성 에셋 번들: `assets/generated/ember-guardian/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 보드 렌더링 연결: `src/game/phaser/objects/BoardGrid.ts`
- 씬 preload 및 애니메이션 설정: `src/game/phaser/scenes/BattleScene.ts`

현재 불씨 수호병은 4프레임 idle 시트와 6프레임 attack 시트를 사용한다. 두 시트 모두 프레임 크기는 128x128이고 배경은 투명이다. 적 유닛은 기본적으로 좌우 반전해서 표시하며, 공격 애니메이션은 대상 위치에 따라 바라보는 방향을 다시 맞춘다.

## 잿불 결투가 스프라이트

- 생성 에셋 번들: `assets/generated/cinder-duelist/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 벤치 카드 이미지 등록: `src/components/bench/BenchSlot.tsx`
- 드래그 프리뷰 이미지 등록: `src/game/phaser/PhaserGame.tsx`

잿불 결투가는 4프레임 idle 시트와 6프레임 attack 시트를 사용한다. 두 시트 모두 프레임 크기는 128x128이고 배경은 투명이다. 불씨 수호병보다 가벼운 체형, 붉은 스카프, 양손으로 드는 큰 화염 도검 실루엣으로 구분한다. 그림자 추적자의 쌍단검과 겹치지 않도록 기본 자세와 공격 동작 모두 단일 대검을 유지한다.

## 잿불 결투가 스킬 이펙트

- 구현 위치: `src/game/phaser/objects/BoardGrid.ts`
- 적용 조건: `unitId === 'cinder-duelist'`
- 스킬 시전: 붉은 준비 링, 교차 검광, 잿불 파편을 재생한다.
- 스킬 타격: 같은 이벤트 묶음의 `skillCast`와 `damage`를 연결해 기본공격 대신 쌍검 돌진 베기, 잔상, 주황색 타격 폭발을 재생한다.

잿불 결투가의 스킬 데미지는 일반 `damage` 이벤트와 같은 타입으로 들어오기 때문에, 렌더링 단계에서 같은 틱에 발생한 `skillCast`의 source를 모아 스킬 타격 여부를 판별한다.

## 서리 궁수 스프라이트

- 생성 에셋 번들: `assets/generated/frost-archer/`
- Phaser 스프라이트 등록: `src/game/phaser/objects/UnitSprite.ts`
- 벤치 카드 이미지 등록: `src/components/bench/BenchSlot.tsx`
- 드래그 프리뷰 이미지 등록: `src/game/phaser/PhaserGame.tsx`

서리 궁수는 4프레임 idle 시트와 6프레임 attack 시트를 사용한다. 두 시트 모두 프레임 크기는 128x128이고 배경은 투명이다. 차가운 파란색 팔레트, 후드, 털 장식, 서리 활 실루엣으로 화염 계열 유닛과 구분한다.

## 서리 궁수 스킬 이펙트

- 구현 위치: `src/game/phaser/objects/BoardGrid.ts`
- 적용 조건: `unitId === 'frost-archer'`
- 스킬 시전: 푸른 조준 링, 활 광택, 서리 파편을 재생한다.
- 기본공격: 공용 투사체 대신 흰색 화살대, 작은 팁, 깃, 짧은 잔상을 재생한다.
- 스킬 타격: 같은 이벤트 묶음의 `skillCast`와 `damage`를 연결해 더 크고 푸른 냉기 화살, 냉기 잔상, 빙결 파편 폭발을 재생한다.

## 불씨 수호병 스킬 이펙트

- 구현 위치: `src/game/phaser/objects/BoardGrid.ts`
- 적용 조건: `unitId === 'ember-guard'`
- 스킬 시전: 주황색 코어 펄스, 이중 링, 불씨 파편, 충격파를 재생한다.
- 보호막 적용: 파란 공용 보호막 대신 주황색 화염 방패 링과 회전하는 불씨 입자를 재생한다.

현재 스킬 이펙트는 별도 이미지 시트 없이 Phaser 도형과 트윈으로 구성한다. 새 유닛 전용 스킬 이펙트를 추가할 때는 공용 `playSkillCastEffect` 또는 `playShieldEffect`에 조건 분기를 추가하고, 유닛별 전용 메서드를 분리한다.

## 벤치 카드

- 벤치 슬롯 컴포넌트: `src/components/bench/BenchSlot.tsx`
- 벤치 카드 레이아웃: `src/components/bench/Bench.module.css`

벤치 유닛은 유닛 이미지, 별 등급, 계열/직업, 비용을 포함한 작은 카드로 표시한다. 불씨 수호병은 가벼운 카드 이미지로 `assets/generated/ember-guardian/idle/frames/ember_guardian_idle_01.png`를 사용한다. 다른 유닛은 전용 이미지가 추가되기 전까지 이름 앞글자 배지로 표시한다.

벤치에서 유닛을 드래그할 때는 `src/game/phaser/PhaserGame.tsx`가 현재 포인터 위치를 추적하고, `src/game/phaser/PhaserGame.module.css`의 `dragPreview` 스타일로 작은 카드 프리뷰를 커서 옆에 표시한다. 프리뷰는 `pointer-events: none`이라 실제 배치 판정은 기존 보드 입력 흐름을 그대로 사용한다.

새 유닛 이미지를 추가할 때는 생성 또는 최적화한 카드 이미지를 `BenchSlot.tsx`의 `unitPortraits` 맵에 등록한다.
