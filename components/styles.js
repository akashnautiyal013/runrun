'use strict';

var React = require('react-native');
var {
  StyleSheet
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#296EFF'    
  },
  topToolbar: {
    //paddingLeft: 10,
    backgroundColor: '#296EFF',  //ff d7 00
    borderBottomColor: '#296EFF',
    borderBottomWidth: 1,
    paddingRight: 5,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    height: 46
  },
  iosStatusBar: {
    height: 20,
    backgroundColor: '#296EFF'
  },
  bottomToolbar: {
  	paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#eee',
    borderTopColor: '#d6d6d6',
    borderTopWidth: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    height: 46
  },
  toolbarTitle: {
    color:'white',
  	fontWeight: 'bold', 
  	fontSize: 18, 
  	flex: 1, 
  	textAlign: 'center'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  iconButton: {
    
  },
  backButtonIcon: {
  	//marginRight: 
  },
  backButtonText: {
  	fontSize: 18,
  	color: 'white'
  },
  redButton: {
    backgroundColor: 'black'
  },
  greenButton: {
    backgroundColor: '#5CB85C'
  }
  
});

module.exports = styles;