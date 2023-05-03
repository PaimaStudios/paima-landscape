# Paima Landscape

# Project Setup

```bash
git submodule update --init --recursive
export PROJECT_PATH=../
cd landscapeapp
yarn install
```

# Setup data

```bash
cd landscapeapp
export PROJECT_PATH=../
either
    yarn fetch # run when adding new entries
or
    yarn update # run to refetch cached data
```

# Dev build

```bash
cd landscapeapp
export PROJECT_PATH=../
yarn open:src
yarn build
```
