DuckieTV.run(['TorrentSearchEngines', 'SettingsService', '$q', '$http', '$injector',
  function(TorrentSearchEngines, SettingsService, $q, $http, $injector) {
    if (SettingsService.get('torrenting.enabled')) {
      TorrentSearchEngines.registerSearchEngine('EXT', new GenericTorrentSearchEngine({
        mirror: SettingsService.get('mirror.EXT'),
        mirrorResolver: null,
        includeBaseURL: true,
        endpoints: {
          search: '/search?%o&q=%s'
        },
        selectors: {
          resultContainer: 'table.table-striped > tbody > tr',
          releasename: ['td:nth-child(1) div a', 'innerText'],
          size: ['td:nth-child(2)', 'innerText'],
          seeders: ['span.text-success', 'innerText'],
          leechers: ['span.text-danger', 'innerText'],
          detailUrl: ['td:nth-child(1) div a', 'href']
        },
        detailsSelectors: {
          detailsContainer: 'div.pt-2',
          magnetUrl: ['a[href^="magnet:?xt="]', 'href']
        },
        orderby: {
          age: {d: 'order=age&sort=desc', a: 'order=age&sort=asc'},
          seeders: {d: 'order=seed&sort=desc', a: 'order=seed&sort=asc'},
          leechers: {d: 'order=leech&sort=desc', a: 'order=leech&sort=asc'},
          size: {d: 'order=size&sort=desc', a: 'order=size&sort=asc'}
        }
      }, $q, $http, $injector))
    }
  }
])
