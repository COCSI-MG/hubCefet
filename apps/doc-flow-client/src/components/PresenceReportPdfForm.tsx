import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 0,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: 150,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 0,
    alignItems: "center",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 80,
  },
  textContainer: {
    marginVertical: 0,
    width: "80%",
  },
  text: {
    fontSize: 14,
    lineHeight: 1.5,
  },
  dateContainer: {
    width: "100%",
    marginTop: 40,
  },
  dateText: {
    textAlign: "right",
    fontSize: 14,
    marginRight: 20,
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signatureImage: {
    width: 220,
    height: 80,
    marginHorizontal: 30,
  },
  footerImage: {
    width: "100%",
    height: 100,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});

export const CertificatePDF = ({
  nome,
  atividade,
  horas,
  dataInicio,
  dataFim,
}: {
  nome: string | undefined;
  atividade: string;
  horas: number;
  dataInicio: string;
  dataFim: string;
}) => {
  const formattedCurrentDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <Image style={styles.headerImage} src="/images/header_sepex.png" />
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={[styles.text, { textAlign: "justify" }]}>
              O Centro Federal de Educação Tecnológica Celso Suckow da Fonseca
              certifica que {nome} apresentou a Atividade {atividade}, com
              duração de {horas} horas, durante a realização da Semana de
              Ensino, Pesquisa e Extensão 2024 – “Biomas do Brasil: diversidade,
              saberes e tecnologias sociais” evento anual promovido pelo
              Departamento de Extensão e Assuntos Comunitário – DEAC, no período
              de {dataInicio} a {dataFim}.
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              Rio de Janeiro, {formattedCurrentDate}
            </Text>
          </View>
          <View style={styles.signatures}>
            <Image
              style={styles.signatureImage}
              src="/images/assinatura_maria_flow.png"
            />
            <Image
              style={styles.signatureImage}
              src="/images/assinatura_renata_flow.png"
            />
          </View>
        </View>
        <Image style={styles.footerImage} src="/images/final_text_sepex.png" />
      </Page>
    </Document>
  );
};

export default CertificatePDF;
