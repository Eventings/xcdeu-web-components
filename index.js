import chooseUser from './src/components/chooseUser'
import fileUp from './src/components/FileUp'
import editor from './src/components/editor'
import logo from './src/components/Logo'
import user from './src/components/User'

const XcComponents = {
  path: function(){
    var jsPath = document.currentScript ? document.currentScript.src : function(){
      var js = document.scripts
        ,last = js.length - 1
        ,src;
      for(var i = last; i > 0; i--){
        if(js[i].readyState === 'interactive'){
          src = js[i].src;
          break;
        }
      }
      return src || js[last].src;
    }();
    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }(),
  install: Vue => {
    Vue.component(chooseUser.name, chooseUser)
    Vue.component(fileUp.name, fileUp)
    Vue.component(editor.name, editor)
    Vue.component(logo.name, logo)
    Vue.component(user.name, user)
  }
}

if ('Vue' in window) {
  Vue.use(XcComponents)
}

export default XcComponents;
