// https://www.sanity.io/docs/structure-builder-cheat-sheet
/**
 * Custom desk structure for Sanity Studio
 */
export const structure = (S: any) =>
  S.list()
    .title('Blog')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item: any) => item.getId() && !['post', 'category', 'author'].includes(item.getId()),
      ),
    ])
