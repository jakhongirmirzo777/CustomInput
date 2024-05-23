<template>
  <input
      type="text"
      ref="inputRef"
      class="custom__input"
      :placeholder="dateFormat"
      :value="inputValue"
      @input="onInput"
      @keydown="onKeyDown"
      @focus="onFocus"
      @click="onClick"
  >
</template>

<script setup lang="ts">
import type {CustomInputProps, CustomInputEmits, DateFormatType} from "@/components/CustomInput/custom-input.types";
import {onMounted, onUnmounted, ref, nextTick} from "vue";

const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const props = defineProps<CustomInputProps>()
const emit = defineEmits<CustomInputEmits>()
const dateFormat = ref<DateFormatType>('DD/MM/YYYY')
const focusTimerIdentifier = ref<ReturnType<typeof setTimeout> | null>(null)
const initialLoad = ref(true)

const isNavigatorLanguageDefault = (): boolean => {
  return dateFormat.value === 'DD/MM/YYYY'
}

const moveCursor = () => {
  const latestValidStrIndex = inputValue.value.replace(/\D/gi, '').length
  if (latestValidStrIndex === 2 || latestValidStrIndex === 3) {
    inputRef.value?.setSelectionRange(latestValidStrIndex + 1, latestValidStrIndex + 1)
  } else if (latestValidStrIndex > 3) {
    inputRef.value?.setSelectionRange(latestValidStrIndex + 2, latestValidStrIndex + 2)
  } else {
    inputRef.value?.setSelectionRange(latestValidStrIndex, latestValidStrIndex)
  }
}

const onFocus = () => {
  if (initialLoad.value) {
    inputValue.value = '__/__/____'
    focusTimerIdentifier.value = setTimeout(() => {
      inputRef.value?.setSelectionRange(0, 0)
    }, 300)
    initialLoad.value = false
  } else {
    moveCursor()
  }
}

const onClick = () => {
  moveCursor()
}

const isValidKey = (key: string): boolean => {
  const navKeys = [
    "Backspace",
    "Delete",
    "Shift",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Tab"
  ];
  const navKeysPattern = navKeys.join('|');
  const combinedRegex = new RegExp(`^[0-9]|${navKeysPattern}$`);
  return combinedRegex.test(key);
}

const isReachedLength = () => {
  const parsedValue = inputValue.value.replace(/\D/ig, '')
  return parsedValue.length === 8
}

const isValidDay = (d: string, key: string): boolean => {
  let isValid = true
  const dayStr = d.replace(/\D/ig, '')

  if (dayStr.length === 0 && +key > 3) {
    isValid = false
  } else if (dayStr.length > 0 && Number(dayStr + key) > 31) {
    isValid = false
  }

  return isValid
}

const isValidMonth = (m: string, key: string): boolean => {
  let isValid = true
  const dayStr = m.replace(/\D/ig, '')

  if (dayStr.length === 0 && +key > 1) {
    isValid = false
  } else if (dayStr.length > 0 && Number(dayStr + key) > 12) {
    isValid = false
  }

  return isValid
}

const isValidYear = (y: string, key: string): boolean => {
  let isValid = true
  const dayStr = y.replace(/\D/ig, '')

  if (dayStr.length === 0 && +key === 0) {
    isValid = false
  }

  return isValid
}

const deleteChar = (value: string, selectionIndex: number): string => {
  const [d, m, y] = value.split('/')
  const day = d.padEnd(2, '_')
  const month = m.padEnd(2, '_')
  const year = y.padEnd(4, '_')
  const finalValue = day + '/' + month + '/' + year
  inputValue.value = finalValue
  nextTick(() => {
    if (selectionIndex === 3 || selectionIndex === 6) {
      inputRef.value?.setSelectionRange(selectionIndex - 1, selectionIndex - 1)
    } else {
      inputRef.value?.setSelectionRange(selectionIndex, selectionIndex)
    }
  })
  return finalValue
}

const insertChar = (value: string, selectionIndex: number): string => {
  const valueArr = value.split('')
  const str = valueArr[selectionIndex - 1]
  valueArr.splice(selectionIndex - 1, 2, str)
  const finalValue = valueArr.join('')
  inputValue.value = finalValue
  nextTick(() => {
    if (selectionIndex === 2 || selectionIndex === 5) {
      inputRef.value?.setSelectionRange(selectionIndex + 1, selectionIndex + 1)
    } else {
      inputRef.value?.setSelectionRange(selectionIndex, selectionIndex)
    }
  })
  return finalValue
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  const selectionIndex = target?.selectionStart || 0
  let finalValue = ''

  if (selectionIndex >= 0) {
    if ((event as unknown as { inputType: string }).inputType === 'deleteContentBackward') {
      finalValue = deleteChar(value, selectionIndex)
    } else {
      finalValue = insertChar(value, selectionIndex)
    }
  }

  const [d, m, y] = finalValue.replace(/_/ig, '').split('/')
  const day = isNavigatorLanguageDefault() ? d.padEnd(2, 'D') : m.padEnd(2, 'D')
  const month = isNavigatorLanguageDefault() ? m.padEnd(2, 'M') : d.padEnd(2, 'M')
  const year = y.padEnd(4, 'Y')
  emit('update:modelValue', year + '-' + month + '-' + day)
}

const onKeyDown = (event: KeyboardEvent) => {
  if (!isValidKey(event.key) || (isReachedLength() && event.key !== 'Backspace')) {
    return event.preventDefault()
  }

  const parsedStr = inputValue.value.replace(/\D/ig, '')
  const [d, m, year] = inputValue.value.split('/')
  const day = isNavigatorLanguageDefault() ? d : m
  const month = isNavigatorLanguageDefault() ? m : d

  if (isNavigatorLanguageDefault()) {
    if (parsedStr.length >= 0 && parsedStr.length <= 1 && !isValidDay(day, event.key)) {
      return event.preventDefault()
    }

    if (parsedStr.length >= 2 && parsedStr.length <= 3 && !isValidMonth(month, event.key)) {
      return event.preventDefault()
    }
  } else {
    if (parsedStr.length >= 0 && parsedStr.length <= 1 && !isValidMonth(month, event.key)) {
      return event.preventDefault()
    }

    if (parsedStr.length >= 2 && parsedStr.length <= 3 && !isValidDay(day, event.key)) {
      return event.preventDefault()
    }
  }

  if (parsedStr.length >= 4 && parsedStr.length <= 9 && !isValidYear(year, event.key)) {
    return event.preventDefault()
  }
}

const setInputFormat = () => {
  dateFormat.value = navigator.language === 'en-US' ? 'MM/DD/YYYY' : 'DD/MM/YYYY'
}

onMounted(() => {
  setInputFormat()
})

onUnmounted(() => {
  focusTimerIdentifier.value && clearTimeout(focusTimerIdentifier.value)
})
</script>

<style scoped>
.custom__input {
  display: block;
  height: 40px;
  border-radius: 6px;
  background-color: #fff;
  border: 1px solid #d4d4d4;
  padding: 0 10px;
  outline: 0;
  font-size: 14px;
  transition: all .2s;
}

.custom__input:focus {
  border-color: #1c86f2;
  box-shadow: 0 0 1px #1c86f2 inset;
}
</style>