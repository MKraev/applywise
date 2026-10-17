# Features and workflow

## Overview

The overview gives a quick summary of your search:

- **Active applications** counts every saved application except those marked Rejected.
- **Interviews** counts applications whose current status is Interview.
- **Follow-ups due** counts non-rejected applications with a follow-up date from today through seven days ahead, including overdue dates.
- **Best role match** shows the highest fit signal among applications with both a job description and a calculable match.
- **Pipeline** counts applications in each status. Recent applications are ordered by application date.
- **Up next** lists up to four follow-ups, earliest date first.

## Application list

The applications screen shows status, application date, next follow-up date, and fit score. Search is case-insensitive and checks the company, role, and location fields. Status filtering can be combined with search.

## Fit signal

The skills profile is compared with each saved job description as follows:

1. Text is converted to lowercase and punctuation is treated as spacing.
2. Each skill is checked as a whole phrase in the normalized job description, rather than as a partial word.
3. The score is the number of matched skill entries divided by the total number of saved skill entries, multiplied by 100 and rounded to the nearest whole percent.

For example, if two of three saved skills are found in a description, its fit signal is 67%. The Insights screen also shows which skills were not found, so you can review possible gaps. A missing phrase does not mean that you lack that ability; job descriptions use varied wording.

The calculation is deliberately simple and runs in the browser. It does not use AI or contact a job site. The signal is not a qualification assessment, hiring recommendation, or prediction of an employer’s decision.

## Responsive layout and accessibility

The layout adapts for smaller screens, moving the main navigation to the bottom on narrow viewports. Forms have labels and validation; dialogs can be closed with the close button or Escape. Application and insight rows can be opened with the keyboard.
