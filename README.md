# Auto Battler

12라운드 PvE 오토배틀러 포트폴리오 프로젝트입니다. 유닛을 구매해 벤치와 7x4 보드에 배치하고, 시너지·아이템·합성을 조합해 자동 전투를 진행합니다.

## Run

```bash
npm install
npm run dev
```

브라우저에 표시된 Vite 주소로 접속합니다.

## Commands

```bash
npm run dev
npm run build
npm test
```

`npm run build`는 TypeScript 검사와 프로덕션 번들을 생성합니다. `npm test`는 핵심 순수 로직 회귀 테스트를 실행합니다.

## Controls

- 상점 카드의 구매 버튼으로 유닛을 벤치에 추가합니다.
- 벤치 유닛을 보드의 플레이어 진영으로 드래그합니다.
- 보드의 원형 토큰을 드래그해 재배치하거나 벤치 영역 밖으로 옮겨 회수합니다.
- 전투 시작 버튼으로 라운드를 진행합니다.
- 오른쪽 유닛 정보 패널에서 아이템을 장착·해제하거나 유닛을 판매합니다.
- 상단에서 저장, 이어하기, 새 게임, 저장 삭제와 오디오 설정을 제어합니다.

## Features

- React UI + Phaser 전투 보드 + Zustand 상태 관리
- 상점, 리롤, XP, 레벨업, 상점 잠금, 경제 보상
- 1성·2성·3성 자동 합성 및 별 등급 스탯 성장
- Origin/Class 시너지, 아이템 장착, 선택형 아이템 보상
- 자동 이동·타겟팅·기본 공격·스킬·사망·승패 처리
- 라운드별 적 편성, 보스 라운드, 저장/이어하기, 합성 음향과 전투 VFX

## Architecture

```text
src/
  app/             React 앱 조립과 레이아웃
  components/      UI 패널, 상점, 벤치, 전투 제어
  data/            유닛, 스킬, 아이템, 시너지, 적 구성
  game/core/       순수 게임 계산
  game/phaser/     보드 렌더링, 입력, 애니메이션, 오디오
  store/           Zustand 게임 상태와 액션
  types/           공유 TypeScript 타입과 상수
```

React는 UI 상태를 표시하고 액션을 호출합니다. Phaser는 Zustand 상태를 받아 렌더링과 연출만 수행합니다. 전투·경제·상점·시너지·아이템·합성 로직은 `game/core`에 분리되어 있습니다.

## Balance

비용별 스탯, 별 등급 배율, 경제, 상점 확률, 적 난이도 곡선은 [BALANCE.md](docs/BALANCE.md)를 참고하세요.

## Limitations

- PvP, 계정, 서버 저장, 실제 에셋 파이프라인은 포함하지 않습니다.
- 스턴과 공격 속도 버프는 확장 가능한 타입과 연출 구조만 준비되어 있으며 전투 판정은 구현 대상이 아닙니다.
- 밸런스는 고정된 12라운드 콘텐츠 기준입니다.
