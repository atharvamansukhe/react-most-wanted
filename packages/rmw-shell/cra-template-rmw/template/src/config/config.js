import { lazy } from 'react'
import locales from './locales'
import routes from './routes'
import themes from './themes'
import parseLanguages from 'base-shell/lib/utils/locale'
import grants from './grants'
import Loading from 'material-ui-shell/lib/components/Loading/Loading'
import getDefaultRoutes from './getDefaultRoutes'
import { defaultUserData, isGranted } from 'rmw-shell/lib/utils/auth'
import { getDatabase, ref, onValue, get, update, off } from 'firebase/database'

const config = {
  firebase: {
    prod: {
      initConfig: {
        apiKey: 'AIzaSyBQAmNJ2DbRyw8PqdmNWlePYtMP0hUcjpY',
        authDomain: 'react-most-wanted-3b1b2.firebaseapp.com',
        databaseURL: 'https://react-most-wanted-3b1b2.firebaseio.com',
        projectId: 'react-most-wanted-3b1b2',
        storageBucket: 'react-most-wanted-3b1b2.appspot.com',
        messagingSenderId: '258373383650',
        appId: '1:258373383650:web:b49ad5dd28da999a',
      },
      messaging: {
        publicVapidKey:
          'BEthk1-Qmoh9opZbi1AUZpxANTu6djVRDph4MLpyO2Qk6Dglm1Sa8Yt_pYi4EhYi3Tj-xgLqUktlbNuP_RP6gto',
      },
    },
    dev: {
      initConfig: {
        apiKey: 'AIzaSyBQAmNJ2DbRyw8PqdmNWlePYtMP0hUcjpY',
        authDomain: 'react-most-wanted-3b1b2.firebaseapp.com',
        databaseURL: 'https://react-most-wanted-3b1b2.firebaseio.com',
        projectId: 'react-most-wanted-3b1b2',
        storageBucket: 'react-most-wanted-3b1b2.appspot.com',
        messagingSenderId: '258373383650',
        appId: '1:258373383650:web:b49ad5dd28da999a',
      },
      messaging: {
        publicVapidKey:
          'BEthk1-Qmoh9opZbi1AUZpxANTu6djVRDph4MLpyO2Qk6Dglm1Sa8Yt_pYi4EhYi3Tj-xgLqUktlbNuP_RP6gto',
      },
    },
    devd: {
      initConfig: {
        apiKey: 'AIzaSyB31cMH9nJnERC1WCWA7lQHnY08voLs-Z0',
        authDomain: 'react-most-wanted-dev.firebaseapp.com',
        databaseURL: 'https://react-most-wanted-dev.firebaseio.com',
        projectId: 'react-most-wanted-dev',
        storageBucket: 'react-most-wanted-dev.appspot.com',
        messagingSenderId: '70650394824',
        appId: '1:70650394824:web:7cd3113c37741efc',
      },
      messaging: {
        publicVapidKey:
          'BGddXH_O6qLmcingsSJx-R3hC8U9yUr2mW4ko63fF__e50WvfRcBfZu_JyBzLI35DNUE5x_9CPBqe64BWniCxV0',
      },
    },
    firebaseuiProps: {
      signInOptions: [
        'google.com',
        'facebook.com',
        'twitter.com',
        'github.com',
        'password',
        'phone',
      ],
    },
  },
  googleMaps: {
    apiKey: 'AIzaSyByMSTTLt1Mf_4K1J9necAbw2NPDu2WD7g',
  },
  auth: {
    grants,
    redirectTo: '/dashboard',
    persistKey: 'base-shell:auth',
    signInURL: '/signin',
    onAuthStateChanged: async (user, auth) => {
      const db = getDatabase()

      try {
        if (user != null) {
          const grantsSnap = await get(ref(db, `user_grants/${user.uid}`))
          const notifcationsDisabledSnap = await get(
            ref(db, `disable_notifications/${user.uid}`)
          )

          const isAdminSnap = await get(ref(db, `admins/${user.uid}`))

          onValue(ref(db, `user_grants/${user.uid}`), (snap) => {
            auth.updateAuth({ grants: snap.val() })
          })
          onValue(ref(db, `disable_notifications/${user.uid}`), (snap) => {
            auth.updateAuth({ notificationsDisabled: !!snap.val() })
          })
          onValue(ref(db, `admins/${user.uid}`), (snap) => {
            auth.updateAuth({ isAdmin: !!snap.val() })
          })

          auth.updateAuth({
            ...defaultUserData(user),
            grants: grantsSnap.val(),
            notificationsDisabled: notifcationsDisabledSnap.val(),
            isAdmin: !!isAdminSnap.val(),
            isGranted,
          })

          update(ref(db, `users/${user.uid}`), {
            displayName: user.displayName,
            uid: user.uid,
            photoURL: user.photoURL,
            providers: user.providerData,
            emailVerified: user.emailVerified,
            isAnonymous: user.isAnonymous,
            notificationsDisabled: notifcationsDisabledSnap.val(),
          })

          update(ref(db, `user_chats/${user.uid}/public_chat`), {
            displayName: 'Public Chat',
            lastMessage: 'Group chat',
            path: `group_chat_messages/public_chat`,
          })
        } else {
          off(ref(db))

          auth.setAuth(defaultUserData(user))
        }
      } catch (error) {
        console.warn(error)
      }
    },
  },
  getDefaultRoutes,
  routes,
  locale: {
    locales,
    persistKey: 'base-shell:locale',
    defaultLocale: parseLanguages(['en', 'de', 'ru'], 'en'),
    onError: (e) => {
      //console.warn(e)

      return
    },
  },
  menu: {
    MenuContent: lazy(() => import('../components/Menu/MenuContent')),
    MenuHeader: lazy(() =>
      import('material-ui-shell/lib/components/MenuHeader/MenuHeader')
    ),
  },
  theme: {
    themes,
    defaultThemeID: 'default',
    defaultType: 'light',
  },
  pages: {
    LandingPage: lazy(() => import('../pages/LandingPage')),
    PageNotFound: lazy(() => import('../pages/PageNotFound')),
  },
  components: {
    Menu: lazy(() => import('material-ui-shell/lib/containers/Menu/Menu')),
    Loading,
  },

  containers: {
    AppContainer: lazy(() =>
      import('material-ui-shell/lib/containers/AppContainer/AppContainer')
    ),
    LayoutContainer: lazy(() =>
      import('rmw-shell/lib/containers/LayoutContainer/LayoutContainer')
    ),
  },
}

export default config
