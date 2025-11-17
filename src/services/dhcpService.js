// Serviço para trabalhar com arquivos DHCP

// Dados do arquivo DHCP fornecido pelo usuário
const DHCP_DATA = `# "+----------------------------------------------------------+"
# "|                                                          |"
# "|                      DHCP - 1 CIA INF                    |"
# "|                                                          |"
# "+----------------------------------------------------------+"

authoritative;
ddns-update-style none;
default-lease-time 3600;
max-lease-time 7200;

subnet 10.112.76.0 netmask 255.255.252.0 {
option domain-name-servers 10.111.10.7,10.111.10.8;
option routers 10.112.76.1;
deny unknown-clients;

# "+----------------------------------------------------------+"
# "|                                                          |"
# "|               SERVIDORES - 14 FAIXAS (2 ao 15)           |"
# "|                                                          |"
# "+----------------------------------------------------------+"

}

host Servidor de aquivos {
hardware ethernet;
fixed-address 10.112.79.2;

}

host Servidor de impressão {
hardware ethernet;
fixed-address 10.112.79.3;

}

host OCS {
hardware ethernet;
fixed-address 10.112.79.4;

}

host Apt-cacher (máquina física) e GLPI (ESTÁ DUPLICADO!!!!!!!!!!!){
hardware ethernet;
fixed-address 10.112.79.5;

}

host vazio (COLOCAR NA MÁQUINA FISICA DO POWER EDGE) {
hardware ethernet;
fixed-address 10.112.79.6;

}

host SPED 2.9 {
hardware ethernet;
fixed-address 10.112.79.7;

}

host vazio {
hardware ethernet;
fixed-address 10.112.79.8;

}

host vazio {
hardware ethernet;
fixed-address 10.112.79.9;

}

host vazio {
hardware ethernet;
fixed-address 10.112.79.10;

}

host GLPI GPCOM {
hardware ethernet;
fixed-address 10.112.79.11;

}

host vazio12 {
hardware ethernet;
fixed-address 10.112.79.12;

}

host vazio13 {
hardware ethernet;
fixed-address 10.112.79.13;

}

host vazio14 {
hardware ethernet;
fixed-address 10.112.79.14;

}

host vazio15 {
hardware ethernet;
fixed-address 10.112.79.15;

}


# "+----------------------------------------------------------+"
# "|                                                          |"
# "|                  CÂMERAS - 30 FAIXAS (16 ao 45)          |"
# "|                                                          |"
# "+----------------------------------------------------------+"

host DVR {
hardware ethernet;
fixed-address 10.112.79.16;

}

host NVR {
hardware ethernet;
fixed-address 10.112.79.17;

}

host Sobressalente {
hardware ethernet;
fixed-address 10.112.79.18;

}

host PORTÃO GUARDA {
hardware ethernet;
fixed-address 10.112.79.19;

}

host ESTACIONAMENTO SFPC {
hardware ethernet;
fixed-address 10.112.79.20;

}

host SACADA CMT {
hardware ethernet;
fixed-address 10.112.79.21;

}

host PORTA S2 {
hardware ethernet;
fixed-address 10.112.79.22;

}

host MAQUETE {
hardware ethernet;
fixed-address 10.112.79.23;

}

host PORTÃO LATERAL {
hardware ethernet;
fixed-address 10.112.79.24;

}

host ALMOX {
hardware ethernet;
fixed-address 10.112.79.25;

}

host SFPC 1 {
hardware ethernet;
fixed-address 10.112.79.26;

}

host SFPC 2 {
hardware ethernet;
fixed-address 10.112.79.27;

}

host PORTA RESERVA DE ARMAMENTO {
hardware ethernet;
fixed-address 10.112.79.28;

}

host RESERVA DE ARMAMENTO ESCANINHO {
hardware ethernet;
fixed-address 10.112.79.29;

}

host RESERVA DE ARMAMENTO MANUTENÇÃO) {
hardware ethernet;
fixed-address 10.112.79.30;

}

host PORTA SFPC {
hardware ethernet;
fixed-address 10.112.79.31;

}

host GERADOR {
hardware ethernet;
fixed-address 10.112.79.32;

}

host PTC {
hardware ethernet;
fixed-address 10.112.79.33;

}

host ESCANIL GUARDA {
hardware ethernet;
fixed-address 10.112.79.34;

}

host vazio35 {
hardware ethernet;
fixed-address 10.112.79.35;

}

host vazio36 {
hardware ethernet;
fixed-address 10.112.79.36;

}

host vazio37 {
hardware ethernet;
fixed-address 10.112.79.37;

}

host vazio38 {
hardware ethernet;
fixed-address 10.112.79.38;

}

host vazio39 {
hardware ethernet;
fixed-address 10.112.79.39;

}

host vazio40 {
hardware ethernet;
fixed-address 10.112.79.40;

}

host vazio41 {
hardware ethernet;
fixed-address 10.112.79.41;

}

host vazio42 {
hardware ethernet;
fixed-address 10.112.79.42;

}

host vazio43 {
hardware ethernet;
fixed-address 10.112.79.43;

}

host vazio44 {
hardware ethernet;
fixed-address 10.112.79.44;

}

host vazio45 {
hardware ethernet;
fixed-address 10.112.79.45;

}


# "+----------------------------------------------------------+"
# "|                                                          |"
# "|                  SWITCHS - 12 FAIXAS (46 ao 57)          |"
# "|                                                          |"
# "+----------------------------------------------------------+"

host RACK CAMERAS {
hardware ethernet;
fixed-address 10.112.79.46;

}

host vazio47 {
hardware ethernet;
fixed-address 10.112.79.47;

}

host vazio48 {
hardware ethernet;
fixed-address 10.112.79.48;

}

host vazio49 {
hardware ethernet;
fixed-address 10.112.79.49;

}

host vazio50 {
hardware ethernet;
fixed-address 10.112.79.50;

}

host vazio51 {
hardware ethernet;
fixed-address 10.112.79.51;

}

host vazio52 {
hardware ethernet;
fixed-address 10.112.79.52;

}

host vazio53 {
hardware ethernet;
fixed-address 10.112.79.53;

}

host vazio54 {
hardware ethernet;
fixed-address 10.112.79.54;

}

host vazio55 {
hardware ethernet;
fixed-address 10.112.79.55;

}

host vazio56 {
hardware ethernet;
fixed-address 10.112.79.56;

}

host vazio57 {
hardware ethernet;
fixed-address 10.112.79.57;

}


# "+----------------------------------------------------------+"
# "|                                                          |"
# "|                 IMPRESSORAS - 12 FAIXAS (58 ao 69)       |"
# "|                                                          |"
# "+----------------------------------------------------------+"

host IMP-SALC {
hardware ethernet;
fixed-address 10.112.79.58;

}

host IMP-S1 {
hardware ethernet;
fixed-address 10.112.79.59;

}

host IMP-FUSEX {
hardware ethernet;
fixed-address 10.112.79.60;

}

host IMP-SAUDE(HP) {
hardware ethernet;
fixed-address 10.112.79.61;

}

host IMP-SAUDE(PANTUM) {
hardware ethernet;
fixed-address 10.112.79.62;

}

host IMP-SALC {
hardware ethernet;
fixed-address 10.112.79.63;

}

host IMP-PIPA {
hardware ethernet;
fixed-address 10.112.79.64;

}

host vazio65 {
hardware ethernet;
fixed-address 10.112.79.65;

}

host vazio66 {
hardware ethernet;
fixed-address 10.112.79.66;

}

host vazio67 {
hardware ethernet;
fixed-address 10.112.79.67;

}

host vazio68 {
hardware ethernet;
fixed-address 10.112.79.68;

}

host vazio69 {
hardware ethernet;
fixed-address 10.112.79.69;

}


# "+----------------------------------------------------------+"
# "|                                                          |"
# "|                  TELEFONES - 25 FAIXAS (70 ao 94)        |"
# "|                                                          |"
# "+----------------------------------------------------------+"

host CMT {
hardware ethernet ;
fixed-address 10.112.79.70;

}

host Cordinha {
hardware ethernet ;
fixed-address 10.112.79.71;

}

host SCMT {
hardware ethernet;
fixed-address 10.112.79.72;

}

host Tesouraria {
hardware ethernet;
fixed-address 10.112.79.73;

}

host SFPC {
hardware ethernet;
fixed-address 10.112.79.74;

}

host SVP {
hardware ethernet;
fixed-address 10.112.79.75;

}

host COMSOC {
hardware ethernet;
fixed-address 10.112.79.76;

}

host S2 {
hardware ethernet;
fixed-address 10.112.79.77;

}

host Aprov {
hardware ethernet;
fixed-address 10.112.79.78;

}

host Guarda {
hardware ethernet;
fixed-address 10.112.79.79;

}

host secinfor {
hardware ethernet;
fixed-address 10.112.79.80;

}

host Saude {
hardware ethernet;
fixed-address 10.112.79.81;

}

host Almox {
hardware ethernet;
fixed-address 10.112.79.82;

}

host S4 {
hardware ethernet;
fixed-address 10.112.79.83;

}

host EncMat {
hardware ethernet;
fixed-address 10.112.79.84;

}

host Saude2 {
hardware ethernet;
fixed-address 10.112.79.85;

}

host Garagem {
hardware ethernet;
fixed-address 10.112.79.86;

}

host S3 {
hardware ethernet;
fixed-address 10.112.79.87;

}

host SALC {
hardware ethernet;
fixed-address 10.112.79.88;

}

host PIPA {
hardware ethernet;
fixed-address 10.112.79.89;

}

host S1 {
hardware ethernet;
fixed-address 10.112.79.90;

}

host GPCOM {
hardware ethernet;
fixed-address 10.112.79.91;

}

host vazio92 {
hardware ethernet;
fixed-address 10.112.79.92;

}

host vazio93 {
hardware ethernet;
fixed-address 10.112.79.93;

}

host vazio94 {
hardware ethernet;
fixed-address 10.112.79.94;

}


# "+----------------------------------------------------------+"
# "|                     CMT - 4 FAIXAS (95 ao 98)            |"
# "+----------------------------------------------------------+"

#LACRE = 801

host CMT-PC1 {
hardware ethernet;
fixed-address 10.112.79.95;

}

host CMT-NOT1 {
hardware ethernet;
fixed-address 10.112.79.96;

}

host CMT-NOT2 (Cordinha) {
hardware ethernet;
fixed-address 10.112.79.97;

}

host vazio98 {
hardware ethernet;
fixed-address 10.112.79.98;

}


# "+----------------------------------------------------------+"
# "|                     SCMT - 3 FAIXAS (99 ao 101)          |"
# "+----------------------------------------------------------+"

#LACRE = 802

host SCMT-PC1 {
hardware ethernet;
fixed-address 10.112.79.99;

}

host vazio100 {
hardware ethernet;
fixed-address 10.112.79.100;

}

host vazio101 {
hardware ethernet;
fixed-address 10.112.79.101;

}


# "+----------------------------------------------------------+"
# "|                     S1 - 15 FAIXAS (102 ao 116)          |"
# "+----------------------------------------------------------+"

#LACRE = 803 AO 810 

host S1-PC8 (Chefe) {
hardware ethernet;
fixed-address 10.112.79.102;

}

host S1-PC4 {
hardware ethernet;
fixed-address 10.112.79.103;

}

host S1-PC1 {
hardware ethernet;
fixed-address 10.112.79.104;

}

host S1-PC3 {
hardware ethernet;
fixed-address 10.112.79.105;

}

host S1-PC6 {
hardware ethernet;
fixed-address 10.112.79.106;

}

host S1-PC7 {
hardware ethernet;
fixed-address 10.112.79.107;

}

host S1-PC2 {
hardware ethernet;
fixed-address 10.112.79.108;

}

host vazio109 {
hardware ethernet;
fixed-address 10.112.79.109;

}

host vazio110 {
hardware ethernet;
fixed-address 10.112.79.110;

}

host vazio111 {
hardware ethernet;
fixed-address 10.112.79.111;

}

host vazio112 {
hardware ethernet;
fixed-address 10.112.79.112;

}

host vazio113 {
hardware ethernet;
fixed-address 10.112.79.113;

}

host vazio114 {
hardware ethernet;
fixed-address 10.112.79.114;

}

host vazio115 {
hardware ethernet;
fixed-address 10.112.79.115;

}

host vazio116 {
hardware ethernet;
fixed-address 10.112.79.116;

}


# "+----------------------------------------------------------+"
# "|                      S2 - 6 FAIXAS (117 ao 122)          |"
# "+----------------------------------------------------------+"

#LACRE = 

host S2-NOT1 {
hardware ethernet;
fixed-address 10.112.79.117;

}

host S2-NOT2 {
hardware ethernet;
fixed-address 10.112.79.118;

}

host vazio119 {
hardware ethernet;
fixed-address 10.112.79.119;

}

host vazio120 {
hardware ethernet;
fixed-address 10.112.79.120;

}

host vazio121 {
hardware ethernet;
fixed-address 10.112.79.121;

}

host vazio122 {
hardware ethernet;
fixed-address 10.112.79.122;

}


# "+----------------------------------------------------------+"
# "|                      S3 - 9 FAIXAS (123 ao 131)          |"
# "+----------------------------------------------------------+"

#LACRE = 811 AO 813

host CH-S3 (Pc Windows) {
hardware ethernet;
fixed-address 10.112.79.123;

}

host S3-PC3 {
hardware ethernet;
fixed-address 10.112.79.124;

}

host S3-PC2 {
hardware ethernet;
fixed-address 10.112.79.125;

}

host S3-NOT1 {
hardware ethernet;
fixed-address 10.112.79.126;

}

host S3-NOT2 {
hardware ethernet;
fixed-address 10.112.79.127;

}

host vazio128 {
hardware ethernet;
fixed-address 10.112.79.128;

}

host vazio129 {
hardware ethernet;
fixed-address 10.112.79.129;

}

host vazio130 {
hardware ethernet;
fixed-address 10.112.79.130;

}

host vazio131 {
hardware ethernet;
fixed-address 10.112.79.131;

}


# "+----------------------------------------------------------+"
# "|                      S4 - 9 FAIXAS (132 ao 137)          |"
# "+----------------------------------------------------------+"

#LACRE = 814 AO 817

host S4-PC2 {
hardware ethernet;
fixed-address 10.112.79.132;

}

host S4-PC1 {
hardware ethernet;
fixed-address 10.112.79.133;

}

host S4-PC4 {
hardware ethernet;
fixed-address 10.112.79.134;

}

host S4-NOT1 {
hardware ethernet;
fixed-address 10.112.79.135;

}

host vazio136 {
hardware ethernet;
fixed-address 10.112.79.136;

}

host vazio137 {
hardware ethernet;
fixed-address 10.112.79.137;

}

# "+----------------------------------------------------------+"
# "|                      FUSEX - 5 FAIXAS (138 ao 142)      |"
# "+----------------------------------------------------------+"

#LACRE = 818 AO 821

host FUSEX-PC1 {
hardware ethernet;
fixed-address 10.112.79.138;

}

host FUSEX-PC3 {
hardware ethernet;
fixed-address 10.112.79.139;

}

host FUSEX-PC2 {
hardware ethernet;
fixed-address 10.112.79.140;

}

host FUSEX-PC4 {
hardware ethernet;
fixed-address 10.112.79.141;

}

host vazio142 {
hardware ethernet;
fixed-address 10.112.79.142;

}


# "+----------------------------------------------------------+"
# "|                      ALMOX - 6 FAIXAS (143 ao 148)       |"
# "+----------------------------------------------------------+"

#LACRE = 822 AO 824 

host ALMOX-PC1 {
hardware ethernet;
fixed-address 10.112.79.143;

}

host ALMOX-PC2 {
hardware ethernet;
fixed-address 10.112.79.144;

}

host ALMOX-PC3 {
hardware ethernet;
fixed-address 10.112.79.145;

}

host vazio146 {
hardware ethernet;
fixed-address 10.112.79.146;

}

host vazio147 {
hardware ethernet;
fixed-address 10.112.79.147;

}

host vazio148 {
hardware ethernet;
fixed-address 10.112.79.148;

}


# "+----------------------------------------------------------+"
# "|                      SAÚDE - 10 FAIXAS (149 ao 158)      |"
# "+----------------------------------------------------------+"

#LACRE = 825 AO 830

host SAUDE-NOT1 {
hardware ethernet;
fixed-address 10.112.79.149;

}

host SAUDE-PC6 {
hardware ethernet;
fixed-address 10.112.79.150;

}

host SAUDE-PC1 {
hardware ethernet;
fixed-address 10.112.79.151;

}

host SAUDE-PC2 {
hardware ethernet;
fixed-address 10.112.79.152;

}

host SAUDE-PC4 {
hardware ethernet;
fixed-address 10.112.79.153;

}

host vazio154 {
hardware ethernet;
fixed-address 10.112.79.154;

}

host vazio155 {
hardware ethernet;
fixed-address 10.112.79.155;

}

host vazio156 {
hardware ethernet;
fixed-address 10.112.79.156;

}

host vazio157 {
hardware ethernet;
fixed-address 10.112.79.157;

}

host vazio158 {
hardware ethernet;
fixed-address 10.112.79.158;

}


# "+----------------------------------------------------------+"
# "|                        SPP - 3 FAIXAS (159 ao 161)       |"
# "+----------------------------------------------------------+"

#LACRE = 831 AO 832

host SPP-PC2 {
hardware ethernet;
fixed-address 10.112.79.159;

}

host SPP-PC1 {
hardware ethernet;
fixed-address 10.112.79.160;

}

host vazio161 {
hardware ethernet;
fixed-address 10.112.79.161;

}


# "+----------------------------------------------------------+"
# "|                        SVP - 6 FAIXAS (162 ao 167)       |"
# "+----------------------------------------------------------+"

#LACRE = 833 AO 834

host SVP-PC2 {
hardware ethernet;
fixed-address 10.112.79.162;

}

host SVP-PC1 {
hardware ethernet;
fixed-address 10.112.79.163;

}

host SVP-NOT1 {
hardware ethernet;
fixed-address 10.112.79.164;

}

host vazio165 {
hardware ethernet;
fixed-address 10.112.79.165;

}

host vazio166 {
hardware ethernet;
fixed-address 10.112.79.166;

}

host vazio167 {
hardware ethernet;
fixed-address 10.112.79.167;

}


# "+----------------------------------------------------------+"
# "|                      COMSOC - 6 FAIXAS (168 ao 173)      |"
# "+----------------------------------------------------------+"

#LACRE = 835 AO 836

host RP-PC2 {
hardware ethernet;
fixed-address 10.112.79.168;

}

host RP-NOT1 {
hardware ethernet;
fixed-address 10.112.79.169;

}

host RP-PC1 {
hardware ethernet;
fixed-address 10.112.79.170;

}

host RP-NOT2 {
hardware ethernet;
fixed-address 10.112.79.171;

}

host vazio172 {
hardware ethernet;
fixed-address 10.112.79.172;

}

host vazio173 {
hardware ethernet;
fixed-address 10.112.79.173;

}


# "+----------------------------------------------------------+"
# "|                       SALC - 9 FAIXAS (174 ao 183)       |"
# "+----------------------------------------------------------+"

#LACRE = 837 AO 842

host SALC-PC2 {
hardware ethernet;
fixed-address 10.112.79.174;

}

host SALC-PC6 {
hardware ethernet;
fixed-address 10.112.79.175;

}

host SALC-PC5 {
hardware ethernet;
fixed-address 10.112.79.176;

}

host SALC-PC4 {
hardware ethernet;
fixed-address 10.112.79.177;

}

host SALC-PC1 {
hardware ethernet;
fixed-address 10.112.79.178;

}

host vazio179 {
hardware ethernet;
fixed-address 10.112.79.179;

}

host vazio180 {
hardware ethernet;
fixed-address 10.112.79.180;

}

host vazio181 {
hardware ethernet;
fixed-address 10.112.79.181;

}

host vazio182 {
hardware ethernet;
fixed-address 10.112.79.182;

}

host vazio183 {
hardware ethernet;
fixed-address 10.112.79.183;

}

# "+----------------------------------------------------------+"
# "|               APROVISIONAMENTO - 5 FAIXAS (184 ao 188)   |"
# "+----------------------------------------------------------+"

#LACRE =  843 AO 845

host APROV-PC3 {
hardware ethernet;
fixed-address 10.112.79.184;

}

host APROV-PC1 {
hardware ethernet;
fixed-address 10.112.79.185;

}

host APROV-NOT1 {
hardware ethernet;
fixed-address 10.112.79.186;

}

host APROV-PC2 {
hardware ethernet;
fixed-address 10.112.79.187;

}

host vazio188 {
hardware ethernet;
fixed-address 10.112.79.188;

}

# "+----------------------------------------------------------+"
# "|                      BA/5 - 3 FAIXAS (189 ao 191)        |"
# "+----------------------------------------------------------+"

#LACRE = 846

host BA5-PC1 {
hardware ethernet;
fixed-address 10.112.79.189;

}


host vazio190 {
hardware ethernet;
fixed-address 10.112.79.190;

}

host vazio191 {
hardware ethernet;
fixed-address 10.112.79.191;

}

# "+----------------------------------------------------------+"
# "|                        GPCOM - 6 FAIXAS (192 ao 197)     |"
# "+----------------------------------------------------------+"

#LACRE = 847 AO 848

host GPCOM-PC1 {
hardware ethernet;
fixed-address 10.112.79.192;

}

host GPCOM-PC2 {
hardware ethernet;
fixed-address 10.112.79.193;

}

host vazio194 {
hardware ethernet;
fixed-address 10.112.79.194;

}

host vazio195 {
hardware ethernet;
fixed-address 10.112.79.195;

}

host vazio196 {
hardware ethernet;
fixed-address 10.112.79.196;

}

host vazio197 {
hardware ethernet;
fixed-address 10.112.79.197;

}


# "+----------------------------------------------------------+"
# "|                     GARAGEM - 4 FAIXAS (198 ao 201)      |"
# "+----------------------------------------------------------+"

#LACRE = 849

host GAR-NOT1 {
hardware ethernet;
fixed-address 10.112.79.198;

}

host GAR-PC1 {
hardware ethernet;
fixed-address 10.112.79.199;

}

host vazio200 {
hardware ethernet;
fixed-address 10.112.79.200;

}

host vazio201 {
hardware ethernet;
fixed-address 10.112.79.201;

}


# "+----------------------------------------------------------+"
# "|                     FISCADM - 6 FAIXAS (202 ao 207)      |"
# "+----------------------------------------------------------+"

#LACRE = 850 AO 851

host FISC-PC2 (Depreciação) {
hardware ethernet;
fixed-address 10.112.79.202;

}

host FISC-PC1 {
hardware ethernet;
fixed-address 10.112.79.203;

}

host FISC-NOT1 {
hardware ethernet;
fixed-address 10.112.79.204;

}

host vazio205 {
hardware ethernet;
fixed-address 10.112.79.205;

}

host vazio206 {
hardware ethernet;
fixed-address 10.112.79.206;

}

host vazio207 {
hardware ethernet;
fixed-address 10.112.79.207;

}


# "+----------------------------------------------------------+"
# "|                     TESOURARIA - 6 FAIXAS (208 ao 213)   |"
# "+----------------------------------------------------------+"

#LACRE =  852 AO 854

host TESOU-PC1 {
hardware ethernet;
fixed-address 10.112.79.208;

}

host TESOU-PC2 {
hardware ethernet;
fixed-address 10.112.79.209;

}

host TESOU-PC3 {
hardware ethernet;
fixed-address 10.112.79.210;

}

host TESOU-NOT1 {
hardware ethernet;
fixed-address 10.112.79.211;

}

host vazio212 {
hardware ethernet;
fixed-address 10.112.79.212;

}

host vazio213 {
hardware ethernet;
fixed-address 10.112.79.213;

}


# "+----------------------------------------------------------+"
# "|                     PIPA - 6 FAIXAS (214 ao 219)         |"
# "+----------------------------------------------------------+"

#LACRE = 855 AO 858

host PIPA-PC2 {
hardware ethernet;
fixed-address 10.112.79.214;

}

host PIPA-PC4 (Servidor) {
hardware ethernet;
fixed-address 10.112.79.215;

}

host PIPA-NOT1 {
hardware ethernet;
fixed-address 10.112.79.216;

}

host PIPA-PC1 {
hardware ethernet;
fixed-address 10.112.79.217;

}

host PIPA-PC3 {
hardware ethernet;
fixed-address 10.112.79.218;

}

host PIPA-NOT2 {
hardware ethernet;
fixed-address 10.112.79.219;

}


# "+----------------------------------------------------------+"
# "|                   INFORMATICA - 12 FAIXAS (220 ao 231)   |"
# "+----------------------------------------------------------+"

#LACRE = 859 AO 864

host INFOR-NOT1 (LENOVO) {
hardware ethernet;
fixed-address 10.112.79.220;

}

host INFOR-PC6 (AUDITORIO) {
hardware ethernet;
fixed-address 10.112.79.221;

}

host INFOR-PC5 (SALAO DE HONRA) {
hardware ethernet;
fixed-address 10.112.79.222;

}

host INFOR-PC4 (GUARDA) {
hardware ethernet;
fixed-address 10.112.79.223;

}

host INFOR-PC2 (CB JESUS) {
hardware ethernet;
fixed-address 10.112.79.224;

}

host INFOR-PC3 (SGT THALYS) {
hardware ethernet;
fixed-address 10.112.79.225;

}

host INFOR-NOT2 (SAMSUNG) {
hardware ethernet;
fixed-address 10.112.79.226;

}

host INFOR-NOT3 (SAMSUNG) {
hardware ethernet;
fixed-address 10.112.79.227;

}

host vazio228 {
hardware ethernet;
fixed-address 10.112.79.228;

}

host vazio229 {
hardware ethernet;
fixed-address 10.112.79.229;

}

host vazio230 {
hardware ethernet;
fixed-address 10.112.79.230;

}

host vazio231 {
hardware ethernet;
fixed-address 10.112.79.231;

}

# "+----------------------------------------------------------+"
# "|                   SFPC - 6 FAIXAS (232 ao 237)           |"
# "+----------------------------------------------------------+"


host SFPC-NOT1 {
hardware ethernet;
fixed-address 10.112.79.232;

}

host SFPC-NOT3 {
hardware ethernet;
fixed-address 10.112.79.233;

}

host SFPC-NOT2 {
hardware ethernet;
fixed-address 10.112.79.234;

}

host SFPC-NOT4 {
hardware ethernet;
fixed-address 10.112.79.235;

}

host vazio236 {
hardware ethernet;
fixed-address 10.112.79.236;

}

host vazio237 {
hardware ethernet;
fixed-address 10.112.79.237;

}


# "+----------------------------------------------------------+"
# "|                    1ºPEL - 2 FAIXAS (238 ao 239)         |"
# "+----------------------------------------------------------+"

#LACRE = 865

host 1PEL-PC1 {
hardware ethernet;
fixed-address 10.112.79.238;

}

host vazio239 {
hardware ethernet;
fixed-address 10.112.79.239;

}

# "+----------------------------------------------------------+"
# "|                    2ºPEL - 2 FAIXAS (240 ao 241)         |"
# "+----------------------------------------------------------+"

#LACRE = 866

host 2PEL-PC1 {
hardware ethernet;
fixed-address 10.112.79.240;

}

host vazio241 {
hardware ethernet;
fixed-address 10.112.79.241;

}

# "+----------------------------------------------------------+"
# "|                    3ºPEL - 2 FAIXAS (242 ao 243)         |"
# "+----------------------------------------------------------+"

#LACRE = 867

host 3PEL-PC1 {
hardware ethernet;
fixed-address 10.112.79.242;

}

host vazio243 {
hardware ethernet;
fixed-address 10.112.79.243;

}

# "+----------------------------------------------------------+"
# "|                   CONFORMIDADE - 3 FAIXAS (244 ao 246)   |"
# "+----------------------------------------------------------+"

#LACRE = 868

host CONF-PC1 {
hardware ethernet;
fixed-address 10.112.79.244;

}

host vazio245 {
hardware ethernet;
fixed-address 10.112.79.245;

}

# "+----------------------------------------------------------+"
# "|                      PDI - 1 FAIXA (246)                |"
# "+----------------------------------------------------------+"

#LACRE = 869

host PDI-PC1 {
hardware ethernet;
fixed-address 10.112.79.246;

}

# "+----------------------------------------------------------+"
# "|                   SUBTENENCIA - 2 FAIXAS (247 ao 248)    |"
# "+----------------------------------------------------------+"

#LACRE = 870

host SUBT-PC1 {
hardware ethernet;
fixed-address 10.112.79.247;

}

host vazio248 {
hardware ethernet;
fixed-address 10.112.79.248;

}

# "+----------------------------------------------------------+"
# "|                        CS - 6 FAIXAS (249 ao 254)        |"
# "+----------------------------------------------------------+"

host CS-NOT4 {
hardware ethernet;
fixed-address 10.112.79.249;

}

host CS-NOT1 {
hardware ethernet;
fixed-address 10.112.79.250;

}

host CS-NOT3 {
hardware ethernet;
fixed-address 10.112.79.251;

}

host CS-NOT2 {
hardware ethernet;
fixed-address 10.112.79.252;

}

host vazio253 {
hardware ethernet;
fixed-address 10.112.79.253;

}

host vazio254 {
hardware ethernet;
fixed-address 10.112.79.254;

}`;

// Função para importar dados do arquivo DHCP fornecido
export const importProvidedDhcpData = () => {
  try {
    console.log('Importando dados do arquivo DHCP fornecido...');
    
    const computadores = importDhcpFile(DHCP_DATA);
    
    console.log(`Encontrados ${computadores.length} computadores no arquivo DHCP`);
    
    // Salvar no localStorage
    localStorage.setItem('computadores', JSON.stringify(computadores));
    
    console.log('Dados importados com sucesso!');
    return computadores;
  } catch (error) {
    console.error('Erro ao importar dados DHCP:', error);
    throw error;
  }
};

// Função para extrair informações dos hosts do arquivo DHCP
export const parseDhcpFile = (dhcpContent) => {
  const hosts = [];
  const lines = dhcpContent.split('\n');
  
  let currentHost = null;
  let currentSection = '';
  let currentLacre = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Verificar se a linha existe e não é undefined
    if (!line || typeof line !== 'string') {
      continue;
    }
    
    const trimmedLine = line.trim();
    
    // Pular linhas vazias e comentários simples (exceto seções e lacres)
    if (!trimmedLine || (trimmedLine.startsWith('#') && !trimmedLine.includes('FAIXAS') && !trimmedLine.includes('LACRE'))) {
      continue;
    }
    
    // Detectar seção baseada nos comentários
    if (trimmedLine.includes('# "|') && trimmedLine.includes('FAIXAS')) {
      const sectionMatch = trimmedLine.match(/# "|\s*([^|]+)\s*\|/);
      if (sectionMatch && sectionMatch[1]) {
        currentSection = sectionMatch[1].trim();
      }
    }
    
    // Detectar comentário de lacre
    if (trimmedLine.includes('#LACRE')) {
      const lacreMatch = trimmedLine.match(/#LACRE\s*=\s*([0-9]+)/);
      if (lacreMatch && lacreMatch[1]) {
        currentLacre = lacreMatch[1].trim();
      }
    }
    
    // Detectar início de host - formato mais flexível
    if (trimmedLine.startsWith('host ')) {
      // Limpar o host anterior se existir
      if (currentHost && currentHost.ip) {
        hosts.push(currentHost);
      }
      
      // Extrair nome do host - formato mais flexível
      const hostMatch = trimmedLine.match(/host\s+(.+?)(?:\s*\{|\s*$)/);
      if (hostMatch && hostMatch[1]) {
        const hostName = hostMatch[1].trim();
        currentHost = {
          nome: hostName,
          macAddress: '00:00:00:00:00:00', // MAC padrão para todos
          ip: '',
          secao: currentSection || 'Sem seção',
          status: '',
          lacre: currentLacre || '',
          linhaInicial: i + 1,
          linhaFinal: i + 1
        };
      }
    }
    
    // Detectar IP address - formato mais flexível
    if (currentHost && trimmedLine.includes('fixed-address')) {
      const ipMatch = trimmedLine.match(/fixed-address\s+([0-9.]+);?/);
      if (ipMatch && ipMatch[1]) {
        currentHost.ip = ipMatch[1].trim();
      }
    }
    
    // Detectar fim do bloco host
    if (currentHost && trimmedLine === '}') {
      // Só adicionar se tiver IP (evitar hosts incompletos)
      if (currentHost.ip) {
        currentHost.linhaFinal = i + 1;
        hosts.push(currentHost);
      }
      currentHost = null;
    }
  }
  
  // Adicionar o último host se existir
  if (currentHost && currentHost.ip) {
    hosts.push(currentHost);
  }
  
  console.log(`Parseado ${hosts.length} hosts do arquivo DHCP`);
  return hosts;
};

// Função para determinar a seção baseada no nome do host
export const determineSection = (hostName) => {
  const name = hostName.toLowerCase();
  
  if (name.includes('cmt')) return 'CMT';
  if (name.includes('scmt')) return 'SCMT';
  if (name.includes('s1')) return 'S1';
  if (name.includes('s2')) return 'S2';
  if (name.includes('s3')) return 'S3';
  if (name.includes('s4')) return 'S4';
  if (name.includes('fusex')) return 'FUSEX';
  if (name.includes('almox')) return 'ALMOX';
  if (name.includes('saude')) return 'SAÚDE';
  if (name.includes('spp')) return 'SPP';
  if (name.includes('svp')) return 'SVP';
  if (name.includes('comsoc') || name.includes('rp')) return 'COMSOC';
  if (name.includes('salc')) return 'SALC';
  if (name.includes('aprov')) return 'APROV';
  if (name.includes('ba5')) return 'BA5';
  if (name.includes('gpcom')) return 'GPCOM';
  if (name.includes('garagem') || name.includes('gar')) return 'GARAGEM';
  if (name.includes('fisc') || name.includes('fiscadm')) return 'FISCADM';
  if (name.includes('tesou')) return 'TESOURARIA';
  if (name.includes('pipa')) return 'PIPA';
  if (name.includes('infor')) return 'INFOR';
  if (name.includes('sfpc')) return 'SFPC';
  if (name.includes('pel')) return 'PELOTÃO';
  if (name.includes('conf')) return 'CONFORMIDADE';
  if (name.includes('pdi')) return 'PDI';
  if (name.includes('subten') || name.includes('subt')) return 'SUBTENÊNCIA';
  if (name.includes('cs')) return 'CS';
  
  return 'SEM SEÇÃO';
};

// Função para determinar o responsável baseado no nome do host
export const determineResponsible = (hostName) => {
  const name = hostName.toLowerCase();
  
  if (name.includes('chefe')) return 'Chefe';
  if (name.includes('cordinha')) return 'Cordinha';
  if (name.includes('jesus')) return 'CB Jesus';
  if (name.includes('thalys')) return 'SGT Thalys';
  
  return 'Não definido';
};

// Função para gerar arquivo DHCP a partir dos computadores
export const generateDhcpFile = (computadores) => {
  const header = `# "+----------------------------------------------------------+"
# "|                                                          |"
# "|                      DHCP - 1 CIA INF                    |"
# "|                                                          |"
# "+----------------------------------------------------------+"

authoritative;
ddns-update-style none;
default-lease-time 3600;
max-lease-time 7200;

subnet 10.112.76.0 netmask 255.255.252.0 {
option domain-name-servers 10.111.10.7,10.111.10.8;
option routers 10.112.76.1;
deny unknown-clients;

# "+----------------------------------------------------------+"
# "|                                                          |"
# "|               SERVIDORES - 14 FAIXAS (2 ao 15)           |"
# "|                                                          |"
# "+----------------------------------------------------------+"

}`;

  let dhcpContent = header + '\n\n';
  
  // Agrupar computadores por seção
  const groupedBySection = {};
  computadores.forEach(comp => {
    const section = comp.secao || 'SEM SEÇÃO';
    if (!groupedBySection[section]) {
      groupedBySection[section] = [];
    }
    groupedBySection[section].push(comp);
  });
  
  // Gerar hosts agrupados por seção
  Object.keys(groupedBySection).forEach(section => {
    if (section !== 'SEM SEÇÃO') {
      dhcpContent += `# "+----------------------------------------------------------+"\n`;
      dhcpContent += `# "|                      ${section.padEnd(20)} - ${groupedBySection[section].length} FAIXAS                    |"\n`;
      dhcpContent += `# "+----------------------------------------------------------+"\n\n`;
    }
    
    groupedBySection[section].forEach(comp => {
      dhcpContent += `host ${comp.nome} {\n`;
      dhcpContent += `hardware ethernet;\n`;
      dhcpContent += `fixed-address ${comp.ip};\n\n`;
      dhcpContent += `}\n\n`;
    });
  });
  
  return dhcpContent;
};

// Função para importar arquivo DHCP e converter para formato de computadores
export const importDhcpFile = (dhcpContent) => {
  // Verificar se o conteúdo é válido
  if (!dhcpContent || typeof dhcpContent !== 'string') {
    throw new Error('Conteúdo do arquivo DHCP inválido');
  }
  
  const hosts = parseDhcpFile(dhcpContent);
  
  return hosts.map((host, index) => ({
    id: index + 1,
    nome: host.nome,
    ip: host.ip,
    macAddress: host.macAddress || '00:00:00:00:00:00',
    lacre: host.lacre || '',
    status: determineResponsible(host.nome),
    secao: determineSection(host.nome),
    dataCadastro: new Date().toISOString(),
    ultimaAtualizacao: new Date().toISOString()
  }));
};

// Função para exportar computadores para formato DHCP
export const exportToDhcp = (computadores) => {
  return generateDhcpFile(computadores);
};

export default {
  parseDhcpFile,
  determineSection,
  determineResponsible,
  generateDhcpFile,
  importDhcpFile,
  exportToDhcp
};
