<template>
  <div class="product-selector-view">
    <h2>Valgte ({{ numberSelected }})</h2>
    <div class="button-container">
      <button class="selector-button" v-if="props.buttonType === 'fridge'" @click="addToFridge">Legg til i kjøleskap</button>
      <button class="selector-button" v-if="props.buttonType === 'shopping'" @click="addToShoppingList" data-cy="addShopping">Legg til i handleliste</button>
      <button class="selector-button" v-if="props.buttonType === 'wishlist'" @click="addToWishlist">Legg til i ønskeliste</button>
    </div>
    <ProductGrid :searchQuery="searchQuery" @update-selected-products="updateSelectedProducts"/>
  </div>
</template>

<script setup lang="ts">
import { AxiosError } from 'axios'
import { useUserStore } from '../stores/UserStore'
import ProductGrid from './ProductGrid.vue'
import { ref } from 'vue'
import { FridgeItemCardInterface, ItemInterface, ShoppingListItemCardInterface, WishlistItemCardInterface } from './types'
import api from '../utils/httputils'

const userStore = useUserStore()
const searchQuery = ref('')
const selectedProductsInParent = ref<ItemInterface[]>([])
const numberSelected = ref(0)
const emit = defineEmits(['refresh-page'])
const props = defineProps({
  buttonType: {
    type: String,
    required: true
  },
  shoppingListItems: {
    type: Array as () => ShoppingListItemCardInterface[]
  },
  fridgeItems: {
    type: Array as () => FridgeItemCardInterface[]
  },
  wishlistItems: {
    type: Array as () => WishlistItemCardInterface[]
  }
})

const addToFridge = async () => {
  const checkedProductsData = selectedProductsInParent.value.map((value) => ({
    itemId: value.id,
    quantity: value.baseAmount,
    expirationDate: '2023-05-20'
  }))

  const path = '/fridge/add'
  try {
    const response = await api.post(path, checkedProductsData)
    if (response.status === 200) {
      selectedProductsInParent.value = []
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response && error.response.status === 401) {
      userStore.logout()
    }
  }
  emit('refresh-page')
}

function updateSelectedProducts (updatedList: ItemInterface[]) {
  selectedProductsInParent.value = updatedList
  numberSelected.value = selectedProductsInParent.value.length
}

const addToShoppingList = async () => {
  const updateList = []
  const addList = []
  for (const product of selectedProductsInParent.value) {
    const existingItem = props.shoppingListItems?.find(item => item.item.id === product.id)
    if (existingItem) {
      updateList.push({
        itemId: existingItem.id,
        quantity: existingItem.quantity + 1
      })
    } else {
      addList.push({
        itemId: product.id,
        quantity: 1
      })
    }
  }
  if (addList.length > 0) {
    try {
      await api.post('/shopping-list/add', addList)
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response && error.response.status === 401) {
        userStore.logout()
      }
    }
  }

  if (updateList.length > 0) {
    try {
      await api.put('/shopping-list/update', updateList)
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response && error.response.status === 401) {
        userStore.logout()
      }
    }
  }
  selectedProductsInParent.value = []
  emit('refresh-page')
}

async function addToWishlist () {
  const updateList = []
  const addList = []
  for (const product of selectedProductsInParent.value) {
    const existingItem = props.wishlistItems?.find(item => item.item.id === product.id)
    if (existingItem) {
      updateList.push({
        itemId: existingItem.id,
        quantity: existingItem.quantity + 1
      })
    } else {
      addList.push({
        itemId: product.id,
        quantity: 1
      })
    }
  }
  if (addList.length > 0) {
    try {
      await api.post('/wished/add', addList)
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response && error.response.status === 401) {
        userStore.logout()
      }
    }
  }

  if (updateList.length > 0) {
    try {
      await api.put('/shopping-list/update', updateList)
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response && error.response.status === 401) {
        userStore.logout()
      }
    }
  }
  selectedProductsInParent.value = []
  emit('refresh-page')
}

</script>

<style scoped>
.product-selector-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2vh;
  padding: 2rem;
  background-color: rgb(224, 224, 224);
}

h1 {
  margin-bottom: 1.5rem;
}

h2 {
  color: black;
}

.selector-button {
  background-color: #1A7028;
  color: white;
  height: 40px;
  width: 200px;
  margin: 20px;
  border-radius: 100px;
  border: none;
}

.selector-button:hover {
  transform: scale(1.1);
  background-color: #25A13A;
  color: white;
  box-shadow: 0px 15px 25px -5px rgba(darken(dodgerblue, 40%));
}

.selector-button:active {
  background-color: black;
  box-shadow: 0px 4px 8px rgba(darken(dodgerblue, 30%));
  transform: scale(.90);
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
