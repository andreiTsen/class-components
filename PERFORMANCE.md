# Performance Profiling Report

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

## Optimized Results

| Interaction | Commit duration | Render duration |
| --- | ---: | ---: |
| Sort countries | 51.2 ms | 51 ms |
| Search for a country | 27.3 ms | 27.1 ms |
| Select another year | 59.5 ms | 59.3 ms |
| Toggle columns | 7.6 ms | 7.4 ms |

## Performance Comparison

| Interaction | Baseline commit | Optimized commit | Commit improvement | Baseline render | Optimized render | Render improvement |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Sort countries | 445.5 ms | 51.2 ms | 88.5% | 445.3 ms | 51 ms | 88.5% |
| Search for a country | 27.6 ms | 27.3 ms | 1.1% | 27.4 ms | 27.1 ms | 1.1% |
| Select another year | 485.6 ms | 59.5 ms | 87.7% | 485.6 ms | 59.3 ms | 87.8% |
| Toggle columns | 415.2 ms | 7.6 ms | 98.2% | 415 ms | 7.4 ms | 98.2% |

## Optimized Flame Chart Screenshots

### Sort Countries

![Optimized sort countries profiler flame chart](./docs/performance-screenshots/optimized-01-sort-countries.png)

Commit duration: 51.2 ms

Render duration: 51 ms

### Search For A Country

![Optimized search country profiler flame chart](./docs/performance-screenshots/optimized-02-search-country.png)

Commit duration: 27.3 ms

Render duration: 27.1 ms

### Select Another Year

![Optimized select year profiler flame chart](./docs/performance-screenshots/optimized-03-select-year.png)

Commit duration: 59.5 ms

Render duration: 59.3 ms

### Toggle Columns

![Optimized toggle columns profiler flame chart](./docs/performance-screenshots/optimized-04-toggle-columns.png)

Commit duration: 7.6 ms

Render duration: 7.4 ms
