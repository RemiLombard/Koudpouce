// composable pour gérer les annonces (CRUD + filtres + pagination)
// c'est le coeur de l'application côté données

// une annonce peut être une demande d'aide ou une proposition de service
export type ListingType = "demande" | "proposition";

export type ListingStatus = "active" | "closed";

// type de service (jardinage, bricolage, etc.)
export interface ServiceType {
  id: string;
  label: string;
}

// structure d'une annonce telle que renvoyée par l'API
export interface ListingPublic {
  readonly id: string;
  readonly type: ListingType;
  readonly title: string;
  readonly description: string;
  readonly serviceTypeIds: readonly string[];
  readonly cityName: string;
  readonly departmentCode: string;
  readonly status: ListingStatus;
  readonly authorId: string;
  readonly authorDisplayName: string;
  readonly createdAt: string;
  readonly closedAt: string | null;
  readonly distanceKm?: number;
}

export interface ListingFilters {
  type?: ListingType;
  status?: ListingStatus;
  serviceTypeIds?: string[];
  city?: string;
  department?: string;
  q?: string;
  aroundLat?: number;
  aroundLng?: number;
  radiusKm?: number;
  excludeAuthorId?: string;
}

interface ListingsResponse {
  listings: ListingPublic[];
}

const listings = ref<ListingPublic[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const hasMore = ref(false);
const total = ref(0);
const currentFilters = ref<ListingFilters>({});
const currentOffset = ref(0);
const currentPage = ref(1);

export const ITEMS_PER_PAGE = 4;
const LIMIT = 10;

export function useListings() {
  async function createListing(payload: {
    type: ListingType;
    title: string;
    description: string;
    serviceTypeIds: string[];
    addressRaw: string;
    manualLocationFallback?: {
      cityName: string;
      departmentCode: string;
      postalCode?: string;
    };
  }): Promise<ListingPublic> {
    const response = await $fetch<{ listing: ListingPublic }>("/api/listings", {
      method: "POST",
      body: payload,
    });
    return response.listing;
  }

  async function fetchListings(filters: ListingFilters = {}): Promise<void> {
    loading.value = true;
    error.value = null;
    currentFilters.value = filters;
    currentOffset.value = 0;
    currentPage.value = 1;

    try {
      const params = buildQueryParams(filters);
      const response = await $fetch<ListingsResponse>(
        `/api/listings?${params}`,
      );

      listings.value = response.listings;
      total.value = response.listings.length;
      hasMore.value = false;
      currentOffset.value = response.listings.length;
    } catch (err: any) {
      error.value = err?.data?.message ?? "Impossible de charger les annonces.";
      listings.value = [];
      total.value = 0;
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(): Promise<void> {}

  async function fetchListingById(id: string): Promise<ListingPublic | null> {
    try {
      const response = await $fetch<{ listing: ListingPublic }>(
        `/api/listings/${id}`,
      );
      return response.listing;
    } catch {
      return null;
    }
  }

  function buildQueryParams(filters: ListingFilters): string {
    const params = new URLSearchParams();

    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.serviceTypeIds?.length) {
      params.set("serviceTypeIds", filters.serviceTypeIds.join(","));
    }
    if (filters.city) params.set("city", filters.city);
    if (filters.department) params.set("department", filters.department);
    if (filters.q) params.set("q", filters.q);
    if (filters.aroundLat !== undefined)
      params.set("aroundLat", String(filters.aroundLat));
    if (filters.aroundLng !== undefined)
      params.set("aroundLng", String(filters.aroundLng));
    if (filters.radiusKm !== undefined)
      params.set("radiusKm", String(filters.radiusKm));
    if (filters.excludeAuthorId)
      params.set("excludeAuthorId", filters.excludeAuthorId);

    return params.toString();
  }

  const totalPages = computed(() => Math.ceil(total.value / ITEMS_PER_PAGE));

  const paginatedListings = computed(() => {
    const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return listings.value.slice(start, end);
  });

  function goToPage(page: number): void {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return {
    listings: readonly(listings),
    loading: readonly(loading),
    error: readonly(error),
    hasMore: readonly(hasMore),
    total: readonly(total),
    currentPage: readonly(currentPage),
    totalPages,
    paginatedListings,

    fetchListings,
    loadMore,
    fetchListingById,
    createListing,
    goToPage,
  };
}

export async function fetchServiceTypes(): Promise<ServiceType[]> {
  try {
    const response = await $fetch<{ serviceTypes: ServiceType[] }>(
      "/api/service-types",
    );
    return response.serviceTypes;
  } catch {
    return [];
  }
}
