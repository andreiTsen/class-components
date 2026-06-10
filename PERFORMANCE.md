# Performance Profiling Report

## Stage 1: Initial Profiling Baseline

## Baseline Results

| Interaction | Commit duration | Render duration |
| --- | ---: | ---: |
| Sort countries | 445.5 ms | 445.3 ms |
| Search for a country | 27.6 ms | 27.4 ms |
| Select another year | 485.6 ms | 485.6 ms |
| Toggle columns | 415.2 ms | 415 ms |

## Flame Chart Screenshots

### Sort Countries

![Sort countries profiler flame chart](./docs/performance-screenshots/01-sort-countries.png)

Commit duration: 445.5 ms

Render duration: 445.3 ms

### Search For A Country

![Search country profiler flame chart](./docs/performance-screenshots/02-search-country.png)

Commit duration: 27.6 ms

Render duration: 27.4 ms

### Select Another Year

![Select year profiler flame chart](./docs/performance-screenshots/03-select-year.png)

Commit duration: 485.6 ms

Render duration: 485.6 ms

### Toggle Columns

![Toggle columns profiler flame chart](./docs/performance-screenshots/04-toggle-columns.png)

Commit duration: 415.2 ms

Render duration: 415 ms
