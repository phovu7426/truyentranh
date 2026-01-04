<template>
  <div class="enum-usage-example">
    <h2>Ví dụ sử dụng Enum System</h2>
    
    <!-- Lấy tất cả enums -->
    <div class="section">
      <h3>Tất cả Enums</h3>
      <button @click="loadAllEnums" :disabled="loading.all">
        {{ loading.all ? 'Đang tải...' : 'Tải tất cả enums' }}
      </button>
      
      <div v-if="allEnums" class="enum-list">
        <div v-for="(enumItems, enumName) in allEnums" :key="enumName" class="enum-group">
          <h4>{{ enumName }}</h4>
          <div class="enum-items">
            <div v-for="item in enumItems" :key="item.id" class="enum-item">
              <span class="label">{{ item.label }}</span>
              <span v-if="item.color" class="color" :style="{ backgroundColor: item.color }"></span>
              <span v-if="item.icon" class="icon">{{ item.icon }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lấy enum cụ thể -->
    <div class="section">
      <h3>Enum cụ thể</h3>
      <select v-model="selectedEnumName">
        <option value="basicstatus">Basic Status</option>
        <option value="gender">Gender</option>
        <option value="orderstatus">Order Status</option>
        <option value="paymentstatus">Payment Status</option>
        <option value="shippingstatus">Shipping Status</option>
        <option value="userstatus">User Status</option>
        <option value="product_status">Product Status</option>
        <option value="attribute_type">Attribute Type</option>
      </select>
      
      <button @click="loadSpecificEnum" :disabled="loading.specific">
        {{ loading.specific ? 'Đang tải...' : 'Tải enum' }}
      </button>
      
      <div v-if="specificEnum" class="enum-items">
        <div v-for="item in specificEnum" :key="item.id" class="enum-item">
          <span class="label">{{ item.label }}</span>
          <span v-if="item.color" class="color" :style="{ backgroundColor: item.color }"></span>
          <span v-if="item.icon" class="icon">{{ item.icon }}</span>
          <span v-if="item.description" class="description">{{ item.description }}</span>
        </div>
      </div>
    </div>

    <!-- Sử dụng helper functions -->
    <div class="section">
      <h3>Helper Functions</h3>
      <div v-if="specificEnum && specificEnum.length > 0">
        <p>Label của giá trị đầu tiên: {{ getEnumLabel(specificEnum, specificEnum[0]!.value) }}</p>
        <p v-if="getEnumColor(specificEnum, specificEnum[0]!.value)">
          Màu của giá trị đầu tiên:
          <span
            class="color-preview"
            :style="{ backgroundColor: getEnumColor(specificEnum, specificEnum[0]!.value) }"
          ></span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useEnums } from '../composables/useEnums'
import type { EnumResponse, EnumItem, EnumName } from '../types/enum.types'

const { 
  getAllEnums, 
  getEnumByName, 
  getEnumLabel, 
  getEnumColor, 
  getEnumIcon, 
  getEnumDescription 
} = useEnums()

// Reactive data
const allEnums = ref<EnumResponse | null>(null)
const specificEnum = ref<EnumItem[] | null>(null)
const selectedEnumName = ref<EnumName>('basicstatus')

const loading = reactive({
  all: false,
  specific: false
})

// Methods
const loadAllEnums = async () => {
  loading.all = true
  try {
    allEnums.value = await getAllEnums()
    } catch (error) {
  } finally {
    loading.all = false
  }
}

const loadSpecificEnum = async () => {
  loading.specific = true
  try {
    specificEnum.value = await getEnumByName(selectedEnumName.value)
    } catch (error) {
  } finally {
    loading.specific = false
  }
}
</script>

<style scoped>
.enum-usage-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.enum-group {
  margin-bottom: 20px;
}

.enum-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.enum-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.label {
  font-weight: 500;
}

.color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.icon {
  font-size: 16px;
}

.description {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ccc;
  vertical-align: middle;
}

button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}
</style>