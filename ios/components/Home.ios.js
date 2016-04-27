

'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  SwitchIOS
} = React;

var Mapbox = require('react-native-mapbox-gl');

var mapRef = 'mapRef';


//var RNGMap                = require('react-native-gmaps');
//var Polyline              = require('react-native-gmaps/Polyline');
var Icon                  = require('react-native-vector-icons/Ionicons');
var SettingsService       = require('../../components/SettingsService');
var commonStyles          = require('../../components/styles');

var styles = StyleSheet.create({
  workspace: {
    flex: 1
  },
  map: {
    flex: 1
  }
});

SettingsService.init('iOS');

var Home = React.createClass({
  mixins: [Mapbox.Mixin],
  annotations: [],
  locationIcon: 'green-circle.png',
  currentLocation: undefined,
  locationManager: undefined,

  getInitialState: function() {
    return {
      enabled: false,
      isMoving: false,
      paceButtonStyle: commonStyles.disabledButton,
      paceButtonIcon: 'play',
      navigateButtonIcon: 'navigate',
      mapHeight: 280,
      mapWidth: 300,
      zoom: 10,
      annotations: [],
      center: {
        latitude: 40.72052634,
        longitude: -73.97686958312988
      },
      zoom: 12
    };
  },

  componentDidMount: function() {

    var me = this,
        gmap = this.refs.gmap;

    this.locationManager = this.props.locationManager;

    // location event
    this.locationManager.on("location", function(location) {
      console.log('- location: ', JSON.stringify(location, null, 2));

      if (location.sample) {
        console.log('<sample location>');
        return;
      }
      me.addMarker(location);
      me.setCenter(location);
    });
    // http event
    this.locationManager.on("http", function(response) {
      console.log('- http ' + response.status);
      console.log(response.responseText);
    });
    // geofence event
    this.locationManager.on("geofence", function(geofence) {
      console.log('- onGeofence: ', JSON.stringify(geofence));
      me.locationManager.removeGeofence(geofence.identifier);
    });
    // error event
    this.locationManager.on("error", function(error) {
      console.log('- ERROR: ', JSON.stringify(error));
    });
    // motionchange event
    this.locationManager.on("motionchange", function(event) {
      console.log("- motionchange", JSON.stringify(event, null, 2));
      me.setState({
        isMoving: event.is_moving
      });
      me.updatePaceButtonStyle()
    });

    // getGeofences
    this.locationManager.getGeofences(function(rs) {
      console.log('- getGeofences: ', JSON.stringify(rs));
    }, function(error) {
      console.log("- getGeofences ERROR", error);
    });

    SettingsService.getValues(function(values) {
      me.locationManager.configure(values, function(state) {
        console.log('- configure, current state: ', state);
        me.setState({
          enabled: state.enabled
        });
        if (state.enabled) {
          me.initializePolyline();
          me.updatePaceButtonStyle()
        }
      });
    });

    this.setState({
      enabled: false,
      isMoving: false
    });
  },
  addMarker :function(location) {
    this.addAnnotations(mapRef, [this.createMarker(location)]);
    if (this.polyline) {
      this.polyline.coordinates.push([location.coords.latitude, location.coords.longitude]);
      this.updateAnnotation(mapRef, this.polyline);
    }
  },
  createMarker: function(location) {
    return {
        id: location.timestamp,
        type: 'point',
        title: location.timestamp,
        coordinates: [location.coords.latitude, location.coords.longitude]
      };
  },
  initializePolyline: function() {
    this.polyline = {
      type: "polyline",
      coordinates: [],
      title: "Route",
      strokeColor: '#2677FF',
      strokeWidth: 5,
      strokeAlpha: 0.5,
      id: "route"
    };
    this.addAnnotations(mapRef, [this.polyline]);
  },

  onClickMenu: function() {
    this.props.drawer.open();
  },

  onClickEnable: function() {
    var me = this;
    if (!this.state.enabled) {
      this.locationManager.start(function() {
        me.initializePolyline();
      });
    } else {
      this.locationManager.removeGeofences();
      this.locationManager.stop();
      this.locationManager.resetOdometer();
      this.removeAllAnnotations(mapRef);
      this.polyline = null;
    }
    this.setState({
      enabled: !this.state.enabled
    });
    this.updatePaceButtonStyle();
  },
  onClickPace: function() {
    if (!this.state.enabled) { return; }
    var isMoving = !this.state.isMoving;
    this.locationManager.changePace(isMoving);

    this.setState({
      isMoving: isMoving
    });
    this.updatePaceButtonStyle();
  },
  onClickLocate: function() {
    var me = this;
    this.locationManager.getState(function(state) {
      console.log('- state: ', state);
    });

    this.locationManager.getCurrentPosition({timeout: 30}, function(location) {
      me.setCenter(location);
      console.log('- current position: ', JSON.stringify(location));
    }, function(error) {
      console.error('ERROR: getCurrentPosition', error);
      me.setState({navigateButtonIcon: 'navigate'});
    });
  },
  onRegionChange: function() {
    console.log('onRegionChange');
  },
  setCenter: function(location) {
    this.setCenterCoordinateAnimated(mapRef, location.coords.latitude, location.coords.longitude)
  },
  updatePaceButtonStyle: function() {
    var style = commonStyles.disabledButton;
    if (this.state.enabled) {
      style = (this.state.isMoving) ? commonStyles.redButton : commonStyles.greenButton;
    }
    this.setState({
      paceButtonStyle: style,
      paceButtonIcon: (this.state.enabled && this.state.isMoving) ? 'pause' : 'play'
    });
  },
  // MapBox
  onRegionChange: function(location) {
    this.setState({ currentZoom: location.zoom });
  },
  onRegionWillChange:function(location) {
    console.log(location);
  },
  onUpdateUserLocation:function(location) {
    console.log(location);
  },
  onOpenAnnotation:function(annotation) {
    console.log(annotation);
  },
  onRightAnnotationTapped:function(e) {
    console.log(e);
  },

  render: function() {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.iosStatusBar} />
        <View style={commonStyles.topToolbar}>
          <Icon.Button name="ios-settings" onPress={this.onClickMenu} backgroundColor="transparent" size={30} color="white" style={styles.btnMenu} underlayColor={"transparent"} />
          <Text style={commonStyles.toolbarTitle}>ImpactRun</Text>
          <SwitchIOS onValueChange={this.onClickEnable} value={this.state.enabled} />
        </View>
        <View ref="workspace" style={styles.workspace}>
          <Mapbox
            style={styles.map}
            direction={0}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
            showsUserLocation={false}
            ref={mapRef}
            accessToken={'pk.eyJ1IjoiY2hyaXN0b2NyYWN5IiwiYSI6ImVmM2Y2MDA1NzIyMjg1NTdhZGFlYmZiY2QyODVjNzI2In0.htaacx3ZhE5uAWN86-YNAQ'}
            styleURL={this.mapStyles.emerald}
            userTrackingMode={this.userTrackingMode.none}
            centerCoordinate={this.state.center}
            zoomLevel={this.state.zoom}
            onRegionChange={this.onRegionChange}
            onRegionWillChange={this.onRegionWillChange}
            annotations={this.state.annotations}
            onOpenAnnotation={this.onOpenAnnotation}
            onRightAnnotationTapped={this.onRightAnnotationTapped}
            onUpdateUserLocation={this.onUpdateUserLocation} />
        </View>

        <View style={commonStyles.bottomToolbar}>
          <Icon.Button name={this.state.navigateButtonIcon} onPress={this.onClickLocate} size={25} color="#000" underlayColor="#ccc" backgroundColor="transparent" style={styles.btnNavigate} />
          <Text style={{fontWeight: 'bold', fontSize: 18, flex: 1, textAlign: 'center'}}></Text>
          <Icon.Button name={this.state.paceButtonIcon} onPress={this.onClickPace} iconStyle={commonStyles.iconButton} style={this.state.paceButtonStyle}><Text>StartRun</Text></Icon.Button>
        </View>
      </View>
    );
  }
});


module.exports = Home;

