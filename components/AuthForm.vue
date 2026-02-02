<!-- Formulaire d'authentification réutilisable (login ou register) -->
<script setup lang="ts">
// Props : mode (login/register), loading, error
interface Props {
  mode: "register" | "login";
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits<{
  submit: [data: { email: string; password: string; displayName?: string }];
}>();

// Champs du formulaire
const form = reactive({
  email: "",
  password: "",
  passwordConfirm: "",
  displayName: "",
});

const localError = ref<string | null>(null);

function handleSubmit() {
  localError.value = null;

  if (props.mode === "register" && form.password !== form.passwordConfirm) {
    localError.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  if (props.mode === "register" && form.password.length < 6) {
    localError.value = "Le mot de passe doit contenir au moins 6 caractères.";
    return;
  }

  emit("submit", {
    email: form.email,
    password: form.password,
    displayName: props.mode === "register" ? form.displayName : undefined,
  });
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- Email -->
    <div>
      <label for="email" class="label">Adresse email</label>
      <BaseInput
        id="email"
        v-model="form.email"
        type="email"
        placeholder="exemple@email.com"
        autocomplete="email"
        icon="user"
        :disabled="loading"
      />
    </div>

    <!-- Mot de passe -->
    <div>
      <label for="password" class="label">Mot de passe</label>
      <BaseInput
        id="password"
        v-model="form.password"
        type="password"
        placeholder="Au moins 6 caractères"
        :autocomplete="
          mode === 'register' ? 'new-password' : 'current-password'
        "
        :disabled="loading"
      />
    </div>

    <!-- Confirmation mot de passe (inscription uniquement) -->
    <div v-if="mode === 'register'">
      <label for="passwordConfirm" class="label"
        >Confirmer le mot de passe</label
      >
      <BaseInput
        id="passwordConfirm"
        v-model="form.passwordConfirm"
        type="password"
        placeholder="Retapez votre mot de passe"
        autocomplete="new-password"
        :disabled="loading"
      />
    </div>

    <!-- Nom (inscription uniquement) -->
    <div v-if="mode === 'register'">
      <label for="displayName" class="label">Prénom ou nom</label>
      <BaseInput
        id="displayName"
        v-model="form.displayName"
        type="text"
        placeholder="Comment souhaitez-vous être appelé ?"
        autocomplete="name"
        :disabled="loading"
      />
    </div>

    <!-- Message d'erreur -->
    <div
      v-if="error || localError"
      class="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
    >
      <Icon name="x" class="w-5 h-5 flex-shrink-0 mt-0.5" />
      <span>{{ localError || error }}</span>
    </div>

    <!-- Bouton submit -->
    <BaseButton
      type="submit"
      variant="primary"
      size="lg"
      full-width
      :loading="loading"
      :disabled="loading"
    >
      {{ mode === "register" ? "Créer mon compte" : "Me connecter" }}
    </BaseButton>
  </form>
</template>
