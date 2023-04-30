<template>
  <div class="login-form">
    <div class="title">Logg inn</div>
    <div class="update-message">
      <h4> {{ updateMessage }}</h4>
    </div>
    <form @submit.prevent="submitLogin">
      <div class="input-boxes">
        <div class="input-box">
          <i class="fas fa-envelope"></i>
          <input
          type="email"
          v-model="email"
          placeholder="Email..."
          @input="resetUpdate"
          required>
        </div>
        <div class="input-box">
          <i class="fas fa-lock"></i>
          <input
          type="password"
          v-model="password"
          placeholder="Passord..."
          @input="resetUpdate"
          required>
        </div>
        <div class="button input-box">
          <input type="submit" value="Logg inn">
        </div>
        <div class="text sign-up-text">Har du ikke bruker?
          <label @click="emit('switch-view')">Registrer deg</label>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/UserStore'
import router from '../router/index'
import { ref } from 'vue'
import axios from 'axios'
import { SHA256 } from 'crypto-js'

const email = ref('')
const password = ref('')
const updateMessage = ref('')
const emit = defineEmits(['switch-view'])
const userStore = useUserStore()

const validateLogin = () => {
  const emailRegex = ref(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

  if (email.value === '' || password.value === '') {
    updateMessage.value = 'Please fill out all fields.'
    return false
  }
  if (!emailRegex.value.test(String(email.value).toLowerCase())) {
    updateMessage.value = 'Invalid email.'
    return
  }
  if (email.value.length > 50) {
    updateMessage.value = 'Email is too long.'
    return false
  }
  if (password.value.length > 200) {
    updateMessage.value = 'Password is too long.'
    return false
  }

  if (password.value.length < 8) {
    updateMessage.value = 'Password must be at least 8 characters.'
    return false
  }
  return true
}

function resetUpdate () {
  updateMessage.value = ''
}

async function submitLogin () {
  resetUpdate()
  if (validateLogin()) {
    const path = 'http://localhost:8080/user/login'
    const hashedPassword = SHA256(password.value)
    const request = {
      email: email.value,
      password: hashedPassword.toString()
    }

    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }

    await axios.post(path, request, config)
      .then(async (response) => {
        if (response.status === 200) {
          userStore.login(response.data.userEmail)
          if (response.data.childUser) {
            router.push('/subuser')
          } else {
            router.push('/fridge')
          }
        }
      })
      .catch((error) => {
        if (error.response.status === 400) {
          updateMessage.value = error.response.data.message
        }
      })
  }
}
</script>

<style scoped>

.update-message {
  margin-top: 20px;
  height: 30px;
  padding: 0;
}

.update-message h4 {
  font-size: 17px;
  padding: 0;
  margin: 0;
}
</style>