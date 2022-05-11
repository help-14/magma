# Bookmark data

Your bookmark data is in `/data/data.yaml`. You can take a look at sample file for each theme in [sample folder](https://github.com/help-14/magma/tree/main/sample).

## data.yaml
| Field   | Type   | Meaning                                             |
| ------- | ------ | --------------------------------------------------- |
| data | []GroupData | Your data goes here                              |

## GroupData
| Field   | Type   | Meaning                                             |
| ------- | ------ | --------------------------------------------------- |
| title | string | Group title |
| icon | string | Group icon, can be fontawesome class or direct link |
| columns | []ColumnData | |

## ColumnData
| Field   | Type   | Meaning                                             |
| ------- | ------ | --------------------------------------------------- |
| title | string | Column title |
| icon | string | Column icon, can be fontawesome class or direct link |
| bookmarks | []BookmarkData | |

## BookmarkData
| Field   | Type   | Meaning                                             |
| ------- | ------ | --------------------------------------------------- |
| name | string | Bookmark name |
| icon | string | Bookmark icon, can be fontawesome class or direct link |
| url | string | Bookmark url |