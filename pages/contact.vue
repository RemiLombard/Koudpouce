<script setup lang="ts">
useHead({
  title: "Contact - Koudpouce",
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const subjectLabels: Record<string, string> = {
  question: "Question générale",
  bug: "Problème technique",
  suggestion: "Suggestion",
  partenariat: "Partenariat",
  autre: "Autre",
};

async function sendMessage() {
  loading.value = true;
  error.value = null;

  try {
    await $fetch("/api/contact", {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
        subject: subjectLabels[form.subject] || form.subject,
        message: form.message,
      },
    });
    success.value = true;
  } catch (err: any) {
    error.value =
      err?.data?.message ||
      "Une erreur est survenue lors de l'envoi du message.";
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.name = "";
  form.email = "";
  form.subject = "";
  form.message = "";
  success.value = false;
  error.value = null;
}
</script>

<!-- page de contact avec formulaire d'envoi d'email -->
<template>
  <div class="min-h-screen bg-gradient-warm">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-12">
      <!-- titre -->
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-stone-800 mb-3">
          Contactez-nous
        </h1>
        <p class="text-stone-600">
          Une question, une suggestion ou un problème ? Écrivez-nous !
        </p>
      </div>

      <!-- formulaire -->
      <form
        @submit.prevent="sendMessage"
        class="bg-white rounded-2xl shadow-card p-6 md:p-8 space-y-6"
      >
        <!-- message de succès -->
        <div
          v-if="success"
          class="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center"
        >
          <p class="font-medium">Message envoyé avec succès !</p>
          <p class="text-sm mt-1">
            Nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <!-- message d'erreur -->
        <div
          v-if="error"
          class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center"
        >
          {{ error }}
        </div>

        <template v-if="!success">
          <!-- nom -->
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-stone-700 mb-2"
            >
              Votre nom
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              placeholder="Jean Dupont"
              class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          <!-- email -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-stone-700 mb-2"
            >
              Votre email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="jean@exemple.com"
              class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          <!-- sujet -->
          <div>
            <label
              for="subject"
              class="block text-sm font-medium text-stone-700 mb-2"
            >
              Sujet
            </label>
            <select
              id="subject"
              v-model="form.subject"
              required
              class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
            >
              <option value="">Sélectionnez un sujet</option>
              <option value="question">Question générale</option>
              <option value="bug">Signaler un problème technique</option>
              <option value="suggestion">Suggestion d'amélioration</option>
              <option value="partenariat">Proposition de partenariat</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <!-- message -->
          <div>
            <label
              for="message"
              class="block text-sm font-medium text-stone-700 mb-2"
            >
              Votre message
            </label>
            <textarea
              id="message"
              v-model="form.message"
              required
              rows="6"
              placeholder="Décrivez votre demande en détail..."
              class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <!-- bouton d'envoi -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{{
              loading ? "Envoi en cours..." : "Envoyer le message"
            }}</span>
          </button>
        </template>

        <!-- bouton pour renvoyer un message -->
        <button
          v-if="success"
          type="button"
          @click="resetForm"
          class="w-full py-4 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition-colors"
        >
          Envoyer un autre message
        </button>
      </form>

      <!-- informations de contact alternatives -->
      <div class="mt-8 text-center text-stone-600">
        <p class="text-sm">
          Vous pouvez aussi nous contacter directement à
          <a
            href="mailto:remi.lombard70@gmail.com"
            class="text-orange-600 hover:underline font-medium"
          >
            remi.lombard@edu.univ-fcomte.fr
          </a>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Contact - Koudpouce",
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const subjectLabels: Record<string, string> = {
  question: "Question générale",
  bug: "Problème technique",
  suggestion: "Suggestion",
  partenariat: "Partenariat",
  autre: "Autre",
};

async function sendMessage() {
  loading.value = true;
  error.value = null;

  try {
    await $fetch("/api/contact", {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
        subject: subjectLabels[form.subject] || form.subject,
        message: form.message,
      },
    });
    success.value = true;
  } catch (err: any) {
    error.value =
      err?.data?.message ||
      "Une erreur est survenue lors de l'envoi du message.";
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.name = "";
  form.email = "";
  form.subject = "";
  form.message = "";
  success.value = false;
  error.value = null;
}
</script>
