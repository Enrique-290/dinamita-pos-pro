import { useEffect } from "react";
import { usePersistenceStore } from "../../store/persistenceStore";
import { useAppDataStore } from "../../store/appDataStore";
import { useMembershipsStore } from "../../store/membershipsStore";
import { useCajaStore } from "../../store/cajaStore";

export default function PersistenceGate() {
  const { hydrateAll, saveAll, hydrated } = usePersistenceStore();

  const sales = useAppDataStore((s) => s.sales);
  const memberships = useAppDataStore((s) => s.memberships);
  const cashEvents = useAppDataStore((s) => s.cashEvents);
  const lastTicket = useAppDataStore((s) => s.lastTicket);
  const membershipsRows = useMembershipsStore((s) => s.memberships);
  const cajaSessions = useCajaStore((s) => s.sessions);
  const cajaCurrent = useCajaStore((s) => s.currentSession);

  useEffect(() => {
    hydrateAll();
  }, [hydrateAll]);

  useEffect(() => {
    if (!hydrated) return;
    saveAll();
  }, [hydrated, sales, memberships, cashEvents, lastTicket, membershipsRows, cajaSessions, cajaCurrent, saveAll]);

  return null;
}
