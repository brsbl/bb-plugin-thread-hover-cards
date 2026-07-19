# BB Thread Hover Cards

Hover or keyboard-focus a BB sidebar thread to see its current status, latest user request, repository and branch, and pull-request state.

## Install

```bash
bb plugin install .
```

For a pushed repository:

```bash
bb plugin install git:https://github.com/OWNER/bb-plugin-thread-hover-cards.git@main
```

## Development

```bash
npm install
npm run check
bb plugin reload thread-hover-cards
```

## Compatibility

BB Plugin SDK 0.4 has no thread-row hover slot. The frontend therefore anchors to BB's stable `data-sidebar-thread-id` attribute; typed RPC supplies all thread, repository, and PR data. A future native slot should replace only this small DOM bridge.
