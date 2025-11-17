import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { importDhcpFile, exportToDhcp } from '../../services/dhcpService';
import { computadoresAPI } from '../../services/api';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { AdminCard, AdminButton, AdminModal, AdminInput } from '../../components/admin/AdminComponents';

function ImportExport() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const csvInputRef = useRef(null);
  const dhcpInputRef = useRef(null);
  const [stats, setStats] = useState({
    totalComputadores: 0,
    totalGrupos: 0,
    totalIps: 0,
    totalMacAddresses: 0
  });
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      toast.error('Acesso permitido apenas para administradores.');
      navigate('/', { replace: true });
      return;
    }
    setUser(parsedUser);
    loadStats();
  }, [navigate]);


  const ensureAdmin = () => {
    if (!user || user.role !== 'admin') {
      toast.error('Ação restrita a administradores.');
      return false;
    }
    return true;
  };


  const loadStats = async () => {
    try {
      const computadores = await computadoresAPI.getAll();
      const grupos = JSON.parse(localStorage.getItem('grupos') || '[]');
      
      setStats({
        totalComputadores: computadores.length,
        totalGrupos: grupos.length,
        totalIps: new Set(computadores.map(c => c.ip).filter(ip => ip)).size,
        totalMacAddresses: new Set(computadores.map(c => c.macAddress).filter(mac => mac)).size
      });
    } catch (error) {
      // Fallback para localStorage
      const computadores = JSON.parse(localStorage.getItem('computadores') || '[]');
      const grupos = JSON.parse(localStorage.getItem('grupos') || '[]');
      
      setStats({
        totalComputadores: computadores.length,
        totalGrupos: grupos.length,
        totalIps: new Set(computadores.map(c => c.ip).filter(ip => ip)).size,
        totalMacAddresses: new Set(computadores.map(c => c.macAddress).filter(mac => mac)).size
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };


  const handleExportCSV = () => {
    if (!ensureAdmin()) return;
    try {
      const computadores = JSON.parse(localStorage.getItem('computadores') || '[]');
      
      if (computadores.length === 0) {
        toast.warning('Não há computadores para exportar!');
        return;
      }

      // Cabeçalho do CSV
      let csv = 'Nome,IP,MAC Address,Lacre,Seção\n';
      
      // Dados
      computadores.forEach(comp => {
        csv += `"${comp.nome}","${comp.ip}","${comp.macAddress}","${comp.lacre || ''}","${comp.secao || 'Sem seção'}","${comp.status || ''}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clip-computadores-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar CSV!');
      console.error(error);
    }
  };

  const handleClearData = async () => {
    if (!ensureAdmin()) return;
    if (window.confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os computadores, grupos E histórico do Firebase E do navegador. Deseja continuar?')) {
      if (window.confirm('Tem certeza? Esta ação não pode ser desfeita!')) {
        try {
          toast.info('Deletando dados... Por favor aguarde.');
          
          // 🔥 DELETAR TODOS OS COMPUTADORES DO FIREBASE
          const computadoresRef = collection(db, 'computadores');
          const computadoresSnapshot = await getDocs(computadoresRef);
          
          const deleteComputadoresPromises = computadoresSnapshot.docs.map(documento => 
            deleteDoc(doc(db, 'computadores', documento.id))
          );
          await Promise.all(deleteComputadoresPromises);
          console.log(`✅ ${computadoresSnapshot.docs.length} computadores deletados do Firebase`);
          
          // 🔥 DELETAR TODOS OS GRUPOS DO FIREBASE
          const gruposRef = collection(db, 'grupos');
          const gruposSnapshot = await getDocs(gruposRef);
          
          const deleteGruposPromises = gruposSnapshot.docs.map(documento => 
            deleteDoc(doc(db, 'grupos', documento.id))
          );
          await Promise.all(deleteGruposPromises);
          console.log(`✅ ${gruposSnapshot.docs.length} grupos deletados do Firebase`);
          
          // 🔥 DELETAR TODO O HISTÓRICO DE AUDITORIA DO FIREBASE
          try {
            const auditRef = collection(db, 'audit_log');
            const auditSnapshot = await getDocs(auditRef);
            
            const deleteAuditPromises = auditSnapshot.docs.map(documento => 
              deleteDoc(doc(db, 'audit_log', documento.id))
            );
            await Promise.all(deleteAuditPromises);
            console.log(`✅ ${auditSnapshot.docs.length} registros de histórico deletados do Firebase`);
          } catch (auditError) {
            console.error('⚠️ Erro ao deletar histórico de auditoria:', auditError);
            // Continua mesmo se falhar
          }
          
          // 🔥 DELETAR DO LOCALSTORAGE
          localStorage.removeItem('computadores');
          localStorage.removeItem('grupos');
          localStorage.removeItem('historico');
          console.log('✅ localStorage limpo');
          
          loadStats();
          toast.success(`✅ Todos os dados foram apagados! (${computadoresSnapshot.docs.length} computadores + ${gruposSnapshot.docs.length} grupos + histórico)`);
        } catch (error) {
          console.error('❌ Erro ao apagar dados:', error);
          toast.error('Erro ao apagar dados do Firebase. Tente novamente.');
        }
      }
    }
  };

  const handleExportDHCP = () => {
    if (!ensureAdmin()) return;
    try {
      const computadores = JSON.parse(localStorage.getItem('computadores') || '[]');
      
      if (computadores.length === 0) {
        toast.warning('Não há computadores para exportar!');
        return;
      }

      const dhcpContent = exportToDhcp(computadores);

      const blob = new Blob([dhcpContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dhcpd-${new Date().toISOString().split('T')[0]}.conf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Arquivo DHCP exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar arquivo DHCP!');
      console.error(error);
    }
  };


  const handleImportCSV = (event) => {
    if (!ensureAdmin()) return;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          toast.error('Arquivo CSV vazio ou inválido!');
          return;
        }

        // Pular a primeira linha (cabeçalho)
        const dataLines = lines.slice(1);
        const computadores = JSON.parse(localStorage.getItem('computadores') || '[]');
        let importedCount = 0;
        let skippedCount = 0;

        for (let index = 0; index < dataLines.length; index++) {
          const line = dataLines[index];
          // Parse CSV line (considerando valores entre aspas)
          const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
          const values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, ''));

          if (values.length < 6) {
            console.warn(`Linha ${index + 2} ignorada: dados incompletos`);
            skippedCount++;
            continue;
          }

          const [nome, ip, macAddress, lacre, secao, status] = values;

          // Verificar se já existe (por IP ou MAC)
          const exists = computadores.some(
            c => c.ip === ip || c.macAddress === macAddress
          );

          if (!exists) {
            try {
              const newId = await computadoresAPI.add({
                nome: nome || `Computador ${computadores.length + 1}`,
                ip: ip || '',
                macAddress: macAddress || '',
                lacre: lacre || '',
                secao: secao === 'Sem seção' ? '' : secao,
                status: status || ''
              });
              computadores.push({
                id: newId,
                nome: nome || `Computador ${computadores.length + 1}`,
                ip: ip || '',
                macAddress: macAddress || '',
                lacre: lacre || '',
                secao: secao === 'Sem seção' ? '' : secao,
                status: status || '',
                addedAt: new Date().toISOString()
              });
            } catch (err) {
              computadores.push({
                id: Date.now() + Math.random(),
                nome: nome || `Computador ${computadores.length + 1}`,
                ip: ip || '',
                macAddress: macAddress || '',
                lacre: lacre || '',
                secao: secao === 'Sem seção' ? '' : secao,
                status: status || '',
                addedAt: new Date().toISOString()
              });
            }
            importedCount++;
          } else {
            skippedCount++;
          }
        }

        localStorage.setItem('computadores', JSON.stringify(computadores));
        loadStats();

        if (importedCount > 0) {
          toast.success(`${importedCount} computador(es) importado(s) com sucesso!`);
        }
        if (skippedCount > 0) {
          toast.warning(`${skippedCount} computador(es) ignorado(s) (duplicados ou inválidos)`);
        }

        // Limpar o input
        if (csvInputRef.current) {
          csvInputRef.current.value = '';
        }
      } catch (error) {
        toast.error('Erro ao importar CSV! Verifique o formato do arquivo.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleImportDHCP = (event) => {
    if (!ensureAdmin()) return;
    const file = event.target.files[0];
    if (!file) return;

    // Verificar se é um arquivo válido
    if (!file.name.toLowerCase().includes('.conf') && !file.name.toLowerCase().includes('.txt')) {
      toast.error('Por favor, selecione um arquivo .conf ou .txt válido!');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dhcpContent = e.target.result;
        console.log('Conteúdo do arquivo:', dhcpContent.substring(0, 200)); // Log para debug
        
        const importedComputadores = importDhcpFile(dhcpContent);
        
        if (importedComputadores.length === 0) {
          toast.warning('Nenhum computador encontrado no arquivo DHCP! Verifique se o arquivo contém blocos "host" válidos.');
          return;
        }

        const existingComputadores = JSON.parse(localStorage.getItem('computadores') || '[]');
        let importedCount = 0;
        let skippedCount = 0;

        for (const comp of importedComputadores) {
          // Verificar se já existe (por IP)
          const exists = existingComputadores.some(c => c.ip === comp.ip);

          if (!exists) {
            try {
              const newId = await computadoresAPI.add({
                nome: comp.nome,
                ip: comp.ip,
                macAddress: comp.macAddress,
                lacre: comp.lacre || '',
                secao: comp.secao || '',
                status: comp.status || ''
              });
              existingComputadores.push({
                ...comp,
                id: newId,
                dataCadastro: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString()
              });
            } catch (err) {
              existingComputadores.push({
                ...comp,
                id: Date.now() + Math.random(),
                dataCadastro: new Date().toISOString(),
                ultimaAtualizacao: new Date().toISOString()
              });
            }
            importedCount++;
          } else {
            skippedCount++;
          }
        }

        localStorage.setItem('computadores', JSON.stringify(existingComputadores));
        loadStats();

        if (importedCount > 0) {
          toast.success(`${importedCount} computador(es) importado(s) do arquivo DHCP!`);
        }
        if (skippedCount > 0) {
          toast.warning(`${skippedCount} computador(es) ignorado(s) (IPs duplicados)`);
        }

        // Limpar o input
        if (dhcpInputRef.current) {
          dhcpInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Erro detalhado na importação DHCP:', error);
        toast.error(`Erro ao importar arquivo DHCP! Detalhes: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo! Verifique se o arquivo não está corrompido.');
    };
    
    reader.readAsText(file);
  };


  if (!user) return null;

  return (
    <AdminDashboard currentPage="import-export">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Import/Export
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Importe e exporte dados do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl">💻</div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total de Equipamentos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.totalComputadores}</dd>
                </dl>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl">🌐</div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">IPs Únicos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.totalIps || stats.totalComputadores}</dd>
                </dl>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl">🔗</div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">MAC Addresses</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.totalMacAddresses || stats.totalComputadores}</dd>
                </dl>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl">📁</div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total de Grupos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.totalGrupos}</dd>
                </dl>
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 📥 IMPORTAR DADOS */}
          <AdminCard title="Importar Dados">
            <p className="text-gray-600 dark:text-white mb-4">Adicione computadores ao sistema</p>
            
            <div className="space-y-4">
              <input
                type="file"
                ref={csvInputRef}
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              
              <input
                type="file"
                ref={dhcpInputRef}
                accept=".conf,.txt"
                onChange={handleImportDHCP}
                className="hidden"
              />
              
              <button
                onClick={() => csvInputRef.current?.click()}
                className="w-full px-4 py-3 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg border border-indigo-500 dark:border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">📊</span>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Importar CSV</div>
                    <div className="text-xs font-normal text-white/80">Adicionar computadores (não duplica)</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => dhcpInputRef.current?.click()}
                className="w-full px-4 py-3 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg border border-indigo-500 dark:border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">🌐</span>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Importar DHCP</div>
                    <div className="text-xs font-normal text-white/80">Arquivo dhcpd.conf (seu banco de dados)</div>
                  </div>
                </div>
              </button>
            </div>
          </AdminCard>

          {/* 📤 EXPORTAR DADOS */}
          <AdminCard title="Exportar Dados">
            <p className="text-gray-600 dark:text-white mb-4">Salve seus dados em diferentes formatos</p>
            
            <div className="space-y-4">
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-3 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg border border-indigo-500 dark:border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">📊</span>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Exportar CSV</div>
                    <div className="text-xs font-normal text-white/80">Apenas computadores (Excel compatível)</div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleExportDHCP}
                className="w-full px-4 py-3 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg border border-indigo-500 dark:border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">🌐</span>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Exportar DHCP</div>
                    <div className="text-xs font-normal text-white/80">Arquivo dhcpd.conf (formato servidor)</div>
                  </div>
                </div>
              </button>
            </div>
          </AdminCard>

          {/* 🗑️ GERENCIAR DADOS */}
          <AdminCard title="Gerenciar Dados">
            <p className="text-gray-600 dark:text-white mb-4">Ações permanentes de manutenção</p>
            
            <div className="space-y-4">
              <button
                onClick={handleClearData}
                className="w-full px-4 py-3 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white font-medium rounded-lg border border-red-500 dark:border-red-600 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">⚠️</span>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Apagar Todos os Dados</div>
                    <div className="text-xs font-normal text-white/80">Remove computadores e grupos permanentemente</div>
                  </div>
                </div>
              </button>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-start">
                  <span className="text-lg mr-2">⚠️</span>
                  <small className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>CSV:</strong> Adiciona sem duplicar | <strong>DHCP:</strong> Seu banco de dados principal
                  </small>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminDashboard>
  );
}

export default ImportExport;

