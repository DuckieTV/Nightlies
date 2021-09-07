DuckieTV.factory('SeriesAddingState', ['$rootScope',
  function($rootScope) {
    var service = {
      state: {
        isShowing: false
      },
      show: function() {
        document.body.scrollTop = 0
        service.state.isShowing = true
        document.body.classList.add('seriesaddingActive')
      },
      hide: function() {
        document.body.classList.remove('seriesaddingActive')
        service.state.isShowing = false
      },
      toggle: function() {
        if (!service.state.isShowing) {
          service.show()
        } else {
          service.hide()
        }
        $rootScope.$applyAsync()
      }
    }
    return service
  }
])
