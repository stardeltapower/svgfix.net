<template>
  <div class="svg-tool max-w-7xl mx-auto">
    <!-- Tool Header -->
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold text-[rgb(var(--color-text))] mb-2">
        SVG ViewBox Normalizer
      </h1>
      <p class="text-[rgb(var(--color-text-secondary))]">
        Crop whitespace and transform path coordinates to origin
      </p>
    </div>

    <!-- Main Tool Interface -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Input Section -->
      <div class="surface p-4">
        <h2 class="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">Input SVG</h2>

        <!-- File Upload -->
        <div class="mb-4">
          <label
            class="block w-full p-8 border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg text-center cursor-pointer hover:border-[rgb(var(--color-primary))] transition-colors"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <svg class="w-12 h-12 mx-auto mb-2 text-[rgb(var(--color-text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <span class="text-[rgb(var(--color-text-secondary))]">
              Drop SVG file here or click to browse
            </span>
            <input
              type="file"
              accept=".svg,image/svg+xml"
              class="hidden"
              @change="handleFileUpload"
            />
          </label>
        </div>

        <!-- Code Editor -->
        <textarea
          v-model="inputSvg"
          class="code-editor w-full h-64 resize-y"
          placeholder="Or paste your SVG code here..."
        ></textarea>
      </div>

      <!-- Output Section -->
      <div class="surface p-4">
        <h2 class="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">Output SVG</h2>

        <!-- Preview -->
        <div class="mb-4 p-4 bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] rounded-lg h-48 flex items-center justify-center overflow-hidden">
          <div v-if="outputSvg" v-html="outputSvg" class="svg-preview"></div>
          <span v-else class="text-[rgb(var(--color-text-secondary))]">
            Preview will appear here
          </span>
        </div>

        <!-- Output Code -->
        <textarea
          v-model="outputSvg"
          class="code-editor w-full h-64 resize-y"
          readonly
          placeholder="Processed SVG will appear here..."
        ></textarea>
      </div>
    </div>

    <!-- Processing Options -->
    <div class="surface p-4 mb-6">
      <h2 class="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">Processing Options</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="options.cropWhitespace" class="rounded" />
          <span class="text-sm text-[rgb(var(--color-text))]">Crop Whitespace</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="options.transformToOrigin" class="rounded" />
          <span class="text-sm text-[rgb(var(--color-text))]">Transform to Origin</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="options.normalizeViewBox" class="rounded" />
          <span class="text-sm text-[rgb(var(--color-text))]">Normalize ViewBox</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="options.optimize" class="rounded" />
          <span class="text-sm text-[rgb(var(--color-text))]">Optimize (SVGO)</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="options.minify" class="rounded" />
          <span class="text-sm text-[rgb(var(--color-text))]">Minify Output</span>
        </label>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-4 justify-center mb-6">
      <button
        @click="processSvgFile"
        :disabled="!inputSvg || processing"
        class="btn btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="processing">Processing...</span>
        <span v-else>Fix SVG</span>
      </button>
      <button
        @click="downloadSvg"
        :disabled="!outputSvg"
        class="btn btn-secondary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Download
      </button>
      <button
        @click="copyToClipboard"
        :disabled="!outputSvg"
        class="btn btn-secondary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
      <button
        @click="clearAll"
        class="btn btn-secondary px-8 py-3"
      >
        Clear
      </button>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="error" class="surface p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-6">
      <p class="text-red-800 dark:text-red-200">{{ error }}</p>
    </div>
    <div v-if="success" class="surface p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-6">
      <p class="text-green-800 dark:text-green-200">{{ success }}</p>
    </div>

    <!-- Statistics -->
    <div v-if="stats" class="surface p-4">
      <h2 class="text-lg font-semibold text-[rgb(var(--color-text))] mb-3">Statistics</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-[rgb(var(--color-text-secondary))]">Original Size:</span>
          <span class="ml-2 font-semibold text-[rgb(var(--color-text))]">{{ stats.originalSize }} bytes</span>
        </div>
        <div>
          <span class="text-[rgb(var(--color-text-secondary))]">Processed Size:</span>
          <span class="ml-2 font-semibold text-[rgb(var(--color-text))]">{{ stats.processedSize }} bytes</span>
        </div>
        <div>
          <span class="text-[rgb(var(--color-text-secondary))]">Reduction:</span>
          <span class="ml-2 font-semibold text-[rgb(var(--color-text))]">{{ reduction }}%</span>
        </div>
        <div>
          <span class="text-[rgb(var(--color-text-secondary))]">ViewBox:</span>
          <span class="ml-2 font-semibold text-[rgb(var(--color-text))]">{{ viewBoxInfo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { processSvg, type ProcessingOptions, type ProcessingResult } from '@lib/index';

const inputSvg = ref('');
const outputSvg = ref('');
const processing = ref(false);
const error = ref('');
const success = ref('');
const copied = ref(false);
const stats = ref<ProcessingResult['stats'] | null>(null);

const options = ref<ProcessingOptions>({
  cropWhitespace: true,
  transformToOrigin: true,
  normalizeViewBox: true,
  optimize: true,
  minify: false,
});

const reduction = computed(() => {
  if (!stats.value) return 0;
  const { originalSize, processedSize } = stats.value;
  return Math.round(((originalSize - processedSize) / originalSize) * 100);
});

const viewBoxInfo = computed(() => {
  if (!stats.value) return 'N/A';
  const vb = stats.value.viewBoxAfter;
  return `${vb.minX} ${vb.minY} ${vb.width} ${vb.height}`;
});

async function processSvgFile() {
  if (!inputSvg.value.trim()) return;

  processing.value = true;
  error.value = '';
  success.value = '';
  stats.value = null;

  try {
    const result = await processSvg(inputSvg.value, options.value);

    if (result.success) {
      outputSvg.value = result.svg;
      stats.value = result.stats;
      success.value = 'SVG processed successfully!';

      if (result.warnings.length > 0) {
        success.value += ' Warnings: ' + result.warnings.join(', ');
      }
    } else {
      error.value = 'Processing failed: ' + result.errors.join(', ');
    }
  } catch (err) {
    error.value = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
  } finally {
    processing.value = false;
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    inputSvg.value = e.target?.result as string;
  };
  reader.readAsText(file);
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0];
  if (!file || !file.name.endsWith('.svg')) {
    error.value = 'Please drop a valid SVG file';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    inputSvg.value = e.target?.result as string;
  };
  reader.readAsText(file);
}

function downloadSvg() {
  if (!outputSvg.value) return;

  const blob = new Blob([outputSvg.value], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fixed.svg';
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

function clearAll() {
  inputSvg.value = '';
  outputSvg.value = '';
  error.value = '';
  success.value = '';
  stats.value = null;
}
</script>

<style scoped>
.svg-tool {
  /* Scoped styles if needed */
}

.svg-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.svg-preview :deep(svg) {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}
</style>
