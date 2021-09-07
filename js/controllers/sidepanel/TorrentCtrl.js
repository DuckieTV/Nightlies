/**
 * Torrent Control for the torrenting window
 */
DuckieTV.controller('TorrentCtrl', ['$rootScope', '$injector', '$filter', 'DuckieTorrent', 'SidePanelState',
  function($rootScope, $injector, $filter, DuckieTorrent, SidePanelState) {
    var vm = this
    var connectedLbl = $filter('translate')('COMMON/tc-connected/lbl')
    var connectingLbl = $filter('translate')('COMMON/tc-connecting/lbl') + '...'

    /**
     * Closes the SidePanel
     */
    vm.closeSidePanel = function() {
      $injector.get('$state').go('calendar')
    }

    vm.authToken = localStorage.getItem('utorrent.token')
    // uTorrent.setPort(localStorage.getItem('utorrent.port'));
    vm.rpc = null
    vm.status = connectingLbl

    vm.removeToken = function() {
      localStorage.removeItem('utorrent.token')
      localStorage.removeItem('utorrent.preventconnecting')
      window.location.reload()
    }

    vm.getTorrentClientName = function() {
      return DuckieTorrent.getClientName()
    }

    vm.getTorrentClientTemplate = function() {
      return DuckieTorrent.getClientName().toLowerCase().replace(/ /g, '').replace('(pre3.2)', 'Pre32').replace(/3.2\+/, '32plus')
    }

    vm.getTorrentsCount = function() {
      if (vm.rpc) {
        var count = vm.rpc.getTorrents().length
        if (SidePanelState.state.isExpanded && count === 0) {
          setTimeout(function() {
            if (document.getElementById('getTorrentsCount') && document.getElementById('getTorrentsCount').offsetParent !== null) {
              SidePanelState.contract()
            }
          }, 1000)
        }
        return count
      } else {
        return 0
      }
    }

    var autoConnectPoll = function() {
      vm.status = connectingLbl
      $rootScope.$applyAsync()
      DuckieTorrent.getClient().offline = false
      DuckieTorrent.getClient().AutoConnect().then(function(rpc) {
        vm.status = connectedLbl
        vm.rpc = rpc
        $rootScope.$applyAsync()
      })
    }

    $rootScope.$on('torrentclient:connected', function(remote) {
      autoConnectPoll()
    })

    autoConnectPoll()
  }
])
