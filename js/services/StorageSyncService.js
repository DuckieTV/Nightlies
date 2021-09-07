/**
 * ****************** NOT IN USE AND LIKELY BROKEN *********************************
 * The StorageSyncService provides synchronized storage to chrome's chrome.storage.sync api.
 * Chrome.storage.sync is called whenever the preference is enabled and stores the current favorite
 * list of series in the cloud.
 * On on other computers you've signed in on, the list of series is fetched and added.
 * When a remote deletion conflict is detected, the user is required to confirm deletion, otherwise the show
 * will be re-added.
 *
 * Note adding shows should happen in the background thread instead of in the current thread for the reason
 * that a user can close or navigate away from the current DuckieTV tab while the addToFavorites promise is
 * still running.
 */
DuckieTV.factory('StorageSyncService', ['$rootScope', '$q', 'FavoritesService', 'SettingsService', '$injector',
  function($q, FavoritesService, SettingsService, $injector) {
    var service = {

      targets: [],
      isSyncing: false, // syncing is currently in progress
      firstRun: false, // first run?
      lastSynced: null, // timestamp when sync has last run
      activeDlg: null, // instance handle to an active question dialog to prevent multiple questions asked at the same time.
      wipeMode: false,

      registerTarget: function(targetName) {
        console.info('Register new storage sync target!', targetName)
        service.targets.push($injector.get(targetName))
      },

      /**
             * Fetch the list of trakt id's from the FavoritesService
             * @returns array of TRAKT_ID's
             */
      getLocalSeriesList: function() {
        return FavoritesService.getSeries().then(function(series) {
          return $q.all(series.map(function(el) {
            return el.TRAKT_ID
          }))
        })
      },

      compareTarget: function(target, resolveInfo) {
        console.log(' Compare to target!', target)
        return service.getLocalSeriesList().then(function(localSeries) {
          return target.getSeriesList().then(function(remoteSeries) {
            console.log(' Compare local to remote series list: ', localSeries, remoteSeries)
            target.nonLocal = remoteSeries === null ? [] : remoteSeries.filter(function(id) {
              return localSeries.indexOf(id) == -1
            })
            console.log(' Non-local series: ', target.nonLocal)

            target.nonRemote = localSeries === null ? [] : localSeries.filter(function(id) {
              return remoteSeries.indexOf(id) == -1
            })
            console.log(' Non-remote series: ', target.nonRemote)

            function fetchDetailedInfo(trakt_id) {
              return TraktTV.enableBatchMode().findSerieByTRAKTID(trakt_id, true).then(function(result) {
                console.log('found serie!')
                return result
              })
            }

            function detailFetchError(err) {
              console.log('Error fetching detailed trakt.tv info:', err)
              return result
            }

            if (resolveInfo) {
              $q.all(target.nonLocal.map(fetchDetailedInfo, detailFetchError)).then(function(results) {
                target.nonLocal = results
              })
              $q.all(target.nonRemote.map(fetchDetailedInfo, detailFetchError)).then(function(results) {
                target.nonRemote = results
              })
            }
          })
        })
      },

      /**
             * Execute a sync (write) step if syncing is not currently already in progress
             */
      synchronize: function() {
        if (service.isSyncing) {
          console.info('Storage sync: Not synchronizing, already working.')
          return
        }
        console.log('Storage sync: Starting sync process on registered target')
        $q.all(service.targets.map(function(target) {
          return target.sync(watchedList)
        }, function(err) {
          // an error occured during sync
          debugger
        })).then(function() {
          SettingsService.set('lastSync', time)
          service.isSyncing = false
        })
      },

      initialize: function() {

      }

    }
    return service
  }
])

/**
 * Initialize storage sync
 */
  .run(['StorageSyncService', function(StorageSyncService) {
    StorageSyncService.initialize()
  }])
