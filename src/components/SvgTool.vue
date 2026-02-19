<template>
  <div class="svg-tool min-h-[70vh] flex flex-col items-center justify-center px-4">
    <!-- Initial State: Drop Zone -->
    <div v-if="state === 'empty'" class="w-full max-w-2xl">
      <div
        class="drop-zone relative border-2 border-dashed rounded-2xl p-12 md:p-20 text-center cursor-pointer transition-all duration-200"
        :class="{
          'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5': isDragging,
          'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]': !isDragging,
        }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".svg,image/svg+xml"
          class="hidden"
          @change="handleFileUpload"
        />

        <svg
          class="w-16 h-16 mx-auto mb-4 text-[rgb(var(--color-primary))]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p class="text-lg md:text-xl font-medium text-[rgb(var(--color-text))] mb-2">
          Drop your SVG here
        </p>
        <p class="text-sm text-[rgb(var(--color-text-secondary))]">or click to upload</p>
      </div>

      <!-- Paste Input -->
      <div class="mt-6 text-center">
        <button
          class="text-sm text-[rgb(var(--color-primary))] hover:underline"
          @click="showPasteInput = !showPasteInput"
        >
          {{ showPasteInput ? 'Hide paste input' : 'or paste SVG markup' }}
        </button>

        <div v-if="showPasteInput" class="mt-4">
          <textarea
            v-model="pasteInput"
            class="w-full h-32 p-4 text-sm font-mono bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg resize-none focus:outline-none focus:border-[rgb(var(--color-primary))]"
            placeholder="Paste your SVG code here..."
            @paste="handlePaste"
          />
          <button
            v-if="pasteInput.trim()"
            class="mt-3 px-6 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary-hover))] transition-colors"
            @click="processFromPaste"
          >
            Fix SVG
          </button>
        </div>
      </div>
    </div>

    <!-- Processing State -->
    <div v-else-if="state === 'processing'" class="text-center">
      <div
        class="w-12 h-12 mx-auto mb-4 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin"
      />
      <p class="text-[rgb(var(--color-text-secondary))]">Processing...</p>
    </div>

    <!-- Result State -->
    <div v-else-if="state === 'result'" class="w-full max-w-2xl text-center">
      <!-- SVG Preview -->
      <div
        class="mb-6 p-8 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-2xl"
      >
        <div class="svg-preview mx-auto">
          <div class="svg-boundary" v-html="previewHtml" />
        </div>
      </div>

      <!-- Success Badge -->
      <div class="mb-6">
        <span
          class="inline-flex items-center px-4 py-2 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] rounded-full font-medium"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Fixed! Saved {{ reduction }}% ({{ formatBytes(stats?.originalSize || 0) }} →
          {{ formatBytes(stats?.processedSize || 0) }})
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap justify-center gap-3">
        <button
          class="px-6 py-3 bg-[rgb(var(--color-primary))] text-white rounded-lg font-medium hover:bg-[rgb(var(--color-primary-hover))] transition-colors"
          @click="downloadSvg"
        >
          Download
        </button>
        <button
          class="px-6 py-3 bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))] rounded-lg font-medium hover:bg-[rgb(var(--color-border))] transition-colors"
          @click="copyToClipboard"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button
          class="px-6 py-3 bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))] rounded-lg font-medium hover:bg-[rgb(var(--color-border))] transition-colors"
          @click="reset"
        >
          Fix Another
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="state === 'error'" class="w-full max-w-2xl text-center">
      <div
        class="mb-6 p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
      >
        <svg
          class="w-12 h-12 mx-auto mb-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-red-800 dark:text-red-200">
          {{ error }}
        </p>
      </div>
      <button
        class="px-6 py-3 bg-[rgb(var(--color-primary))] text-white rounded-lg font-medium hover:bg-[rgb(var(--color-primary-hover))] transition-colors"
        @click="reset"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { processSvg, type ProcessingResult } from '@lib/index';

type State = 'empty' | 'processing' | 'result' | 'error';

const state = ref<State>('empty');
const isDragging = ref(false);
const showPasteInput = ref(false);
const pasteInput = ref('');
const outputSvg = ref('');
const error = ref('');
const copied = ref(false);
const stats = ref<ProcessingResult['stats'] | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const originalFileName = ref('fixed.svg');

// Preview needs explicit width/height for inline SVG rendering.
// The output SVG may have these stripped by normalizeViewBox for portability,
// so we add them back as 100%/auto for preview scaling.
const previewHtml = computed(() => {
  if (!outputSvg.value) return '';
  const svg = outputSvg.value;
  // Strip any existing width/height and add responsive ones for preview
  let preview = svg.replace(/(<svg[^>]*?)\s+width=["'][^"']*["']/i, '$1');
  preview = preview.replace(/(<svg[^>]*?)\s+height=["'][^"']*["']/i, '$1');
  return preview.replace(/<svg/i, '<svg width="100%" height="100%"');
});

const reduction = computed(() => {
  if (!stats.value) return 0;
  const { originalSize, processedSize } = stats.value;
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - processedSize) / originalSize) * 100);
});

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function triggerFileInput() {
  fileInput.value?.click();
}

async function processInput(svgContent: string) {
  state.value = 'processing';
  error.value = '';
  stats.value = null;

  try {
    // Auto-apply all processing options
    const result = await processSvg(svgContent, {
      cropWhitespace: true,
      transformToOrigin: true,
      normalizeViewBox: true,
      optimize: true,
      minify: false,
    });

    if (result.success) {
      outputSvg.value = result.svg;
      stats.value = result.stats;
      state.value = 'result';
    } else {
      error.value = result.errors.join(', ') || 'Failed to process SVG';
      state.value = 'error';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    state.value = 'error';
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  originalFileName.value = file.name.replace('.svg', '-fixed.svg');

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (content) {
      processInput(content);
    }
  };
  reader.readAsText(file);
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];

  if (!file) return;

  if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
    error.value = 'Please drop a valid SVG file';
    state.value = 'error';
    return;
  }

  originalFileName.value = file.name.replace('.svg', '-fixed.svg');

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (content) {
      processInput(content);
    }
  };
  reader.readAsText(file);
}

function handlePaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text');
  if (text && text.includes('<svg')) {
    pasteInput.value = text;
  }
}

function processFromPaste() {
  if (pasteInput.value.trim()) {
    originalFileName.value = 'pasted-fixed.svg';
    processInput(pasteInput.value);
  }
}

function downloadSvg() {
  if (!outputSvg.value) return;

  const blob = new Blob([outputSvg.value], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = originalFileName.value;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyToClipboard() {
  if (!outputSvg.value) return;

  try {
    await navigator.clipboard.writeText(outputSvg.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    error.value = 'Failed to copy to clipboard';
  }
}

function reset() {
  state.value = 'empty';
  outputSvg.value = '';
  error.value = '';
  stats.value = null;
  pasteInput.value = '';
  showPasteInput.value = false;
  originalFileName.value = 'fixed.svg';
}
</script>

<style scoped>
.svg-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.svg-boundary {
  display: block;
  width: 100%;
  max-height: 320px;
  border: 1px dashed rgba(128, 128, 128, 0.6);
}

.svg-boundary :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
  max-height: 320px;
  object-fit: contain;
}
</style>
