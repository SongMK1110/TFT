# Auto Battler Development Plan

## Project Goal

React, TypeScript, Phaser, and Zustand로 만든 12라운드 PvE 오토배틀러다. React는 UI와 입력, Phaser는 보드 렌더링 및 연출, `game/core`는 순수 게임 계산을 담당한다.

## Architecture Rules

- React: HUD, 상점, 벤치, 패널, 저장 및 설정 UI
- Phaser: 7x4 보드, 유닛 토큰, 이동·공격·스킬·피격 연출
- Game Core: 전투, AI, 경제, 상점, 시너지, 아이템, 합성, 저장 검증
- Zustand: 영속 가능한 게임 상태와 UI 액션의 단일 진입점
- 데이터: 유닛, 스킬, 아이템, 시너지, 적 구성은 `src/data`에서 관리

## Phase Status

- [x] Phase 1. Project Setup: Vite, React, TypeScript, Phaser, Zustand, 전역 스타일
- [x] Phase 2. Data Model: 유닛·아이템·보드·전투·게임 타입 및 더미 데이터
- [x] Phase 3. Basic UI: HUD, 시너지, 유닛 정보, 벤치, 상점 레이아웃
- [x] Phase 4. Board: Phaser 7x4 보드, 좌표 변환, 선택·배치 시각화
- [x] Phase 5. Shop & Bench: 구매, 리롤, XP, 레벨, 상점 잠금
- [x] Phase 6. Drag & Drop: 벤치·보드 간 배치와 레벨 제한
- [x] Phase 7. Combat MVP: 자동 이동, 타겟팅, 공격, 사망, 승패
- [x] Phase 8. Skills: 마나, 단일·범위 피해, 회복, 보호막, 스킬 연출
- [x] Phase 9. Synergy: Origin·Class 계산과 전투 스탯 적용
- [x] Phase 10. Economy & Round: 보상, 이자, 연승·연패, 다음 라운드
- [x] Phase 11. Unit Upgrade: 3개 합성, 별 등급, 판매 가치
- [x] Phase 12. Item System: 인벤토리, 장착·해제, 전투 스탯 반영, 보상 선택
- [x] Phase 13. Enemy AI Improvement: 라운드별 적 편성, 보스, 난이도 배율
- [x] Phase 14. Combat AI & Pathfinding: 타겟 재선정, 경로·예약·충돌 방지
- [x] Phase 15. Animation & VFX: 이동, 투사체, 피해·회복·보호막, 결과 연출
- [x] Phase 16. Audio System: BGM, 효과음, 음소거와 볼륨 설정
- [x] Phase 17. Save / Load: LocalStorage 저장, Continue, Reset Save, 버전 검증
- [x] Phase 18. Performance Optimization: 렌더링 구독, 오브젝트 풀, 전투 탐색 최적화
- [x] Phase 19. Game Balance: 유닛·스킬·시너지·아이템·경제·적 난이도 조정
- [x] Phase 20. QA & Final Polish: 회귀 테스트, 저장 검증, 입력·오디오·문서 안정화

## Current Scope

- 12종 유닛, 7종 아이템, Origin/Class 시너지, 12개 PvE 라운드
- 1성·2성·3성 합성, 아이템 장착, 상점·경제·저장/이어하기
- 기본 공격과 단일·범위 피해, 회복, 보호막 스킬

## Known Limitations

- PvP 매칭, 서버 동기화, 계정 시스템은 범위 밖이다.
- 상태 효과 타입 중 스턴과 공격 속도 버프는 데이터·연출 구조만 있으며 전투 판정은 미구현이다.
- 밸런스는 12라운드 MVP 기준이며 장시간 플레이 통계는 아직 없다.
- Phaser 보드 렌더러와 Zustand의 연결은 안정화됐지만, 대규모 콘텐츠 확장 전 `BoardGrid` 분리가 필요하다.

## Future Improvements

- 결정론적 난수 주입과 라운드 시뮬레이션 기반 밸런스 테스트
- 상태 효과 전투 판정, 더 다양한 적 패턴과 콘텐츠
- 번들 분할, 모바일 전용 레이아웃, 접근성 심화
