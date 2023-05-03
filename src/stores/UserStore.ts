import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import { AxiosError } from 'axios'
import router from '../router/index'
import { SubUser } from '@/components/types'
import api from '../utils/httputils'

// Define user store using Pinia
export const useUserStore = defineStore('userStore', () => {
  const email = ref('')
  const loggedIn = ref(false)
  const subUserLoggedIn = ref(false)
  const role = ref('')
  const subUser = ref<SubUser>()
  const refreshTokenTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

  // Function for refreshing user token
  async function refreshToken () {
    const path = '/user/auth/refreshToken'
    try {
      await api.post(path, null)
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 600) {
        logout()
      }
    } finally {
      startRefreshTimer()
    }
  }

  // Function for starting the refresh timer
  function startRefreshTimer () {
    if (refreshTokenTimeoutId.value) {
      clearTimeout(refreshTokenTimeoutId.value)
    }
    refreshTokenTimeoutId.value = setTimeout(refreshToken, 8 * 60 * 1000)
  }

  onMounted(() => {
    if (subUserLoggedIn.value) {
      startRefreshTimer()
    }
  })

  // Function to stop the refresh token timer
  function stopRefreshTimer () {
    if (refreshTokenTimeoutId.value) {
      clearTimeout(refreshTokenTimeoutId.value)
      refreshTokenTimeoutId.value = null
    }
  }

  async function login (userEmail: string) {
    email.value = userEmail
    loggedIn.value = true
    startRefreshTimer()
  }

  function subUserLogin (subUserParam: SubUser) {
    subUser.value = subUserParam
    subUserLoggedIn.value = true
  }

  function noSubUserLogin () {
    subUserLoggedIn.value = true
  }

  async function logout () {
    email.value = ''
    role.value = ''
    loggedIn.value = false
    subUser.value = undefined
    subUserLoggedIn.value = false
    stopRefreshTimer()
    router.push('/login')
  }
  // Return the reactive refs and functions as store properties
  return {
    email,
    role,
    loggedIn,
    refreshToken,
    login,
    logout,
    subUserLogin,
    noSubUserLogin,
    subUserLoggedIn
  }
},
{
  // Pinia store options
  persist: true
})

export async function checkIsSubUserLoggedIn () {
  const userStore = useUserStore()
  return userStore.subUserLoggedIn
}

export async function checkIsUserLoggedIn () {
  const userStore = useUserStore()
  return userStore.loggedIn
}
