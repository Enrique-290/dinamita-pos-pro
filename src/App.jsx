import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import { useUIStore } from "./store/uiStore";
import Dashboard from "./modules/dashboard/Dashboard";
import Ventas from "./modules/ventas/Ventas";
import Membresias from "./modules/membresias/Membresias";
import Inventario from "./modules/inventario/Inventario";
import Clientes from "./modules/clientes/Clientes";
import Gastos from "./modules/gastos/Gastos";
import Reportes from "./modules/reportes/Reportes";
import Caja from "./modules/caja/Caja";
import Tickets from "./modules/tickets/Tickets";
import Respaldo from "./modules/respaldo/Respaldo";
import Configuracion from "./modules/configuracion/Configuracion";
import Bodega from "./modules/bodega/Bodega";
import Acceso from "./modules/acceso/Acceso";
import PersistenceGate from "./components/system/PersistenceGate";

const modules = {
  dashboard: Dashboard,
  ventas: Ventas,
  membresias: Membresias,
  inventario: Inventario,
  clientes: Clientes,
  gastos: Gastos,
  reportes: Reportes,
  caja: Caja,
  tickets: Tickets,
  respaldo: Respaldo,
  configuracion: Configuracion,
  bodega: Bodega,
  acceso: Acceso,
};

export default function App() {
  const { activeModule } = useUIStore();
  const ActiveView = modules[activeModule] || Dashboard;

  return (
    <>
      <PersistenceGate />
      <div className="min-h-screen bg-dinamita-bg text-dinamita-text lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar />
      <main className="min-w-0">
        <Topbar />
        <ActiveView />
      </main>
      </div>
    </>
  );
}
