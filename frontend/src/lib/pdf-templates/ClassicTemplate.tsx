import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CV } from '@/types/api.types';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 25,
    borderBottom: '2 solid #000000',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: 10,
    color: '#555555',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  contact: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 9,
    color: '#555555',
  },
  contactLine: {
    marginBottom: 3,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottom: '1 solid #000000',
    paddingBottom: 3,
  },
  item: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  itemDate: {
    fontSize: 9,
    color: '#666666',
    fontStyle: 'italic',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 3,
  },
  itemDescription: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  skillsText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
});

interface ClassicTemplateProps {
  cv: CV;
}

export const ClassicTemplate = ({ cv }: ClassicTemplateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{cv.contact?.email.split('@')[0]?.toUpperCase() || 'NOM'}</Text>
        <Text style={styles.title}>{cv.title}</Text>
        {cv.summary && <Text style={styles.summary}>{cv.summary}</Text>}
      </View>

      {/* Contact */}
      {cv.contact && (
        <View style={styles.contact}>
          <Text style={styles.contactLine}>{cv.contact.email}</Text>
          <Text style={styles.contactLine}>{cv.contact.phone_number}</Text>
          <Text style={styles.contactLine}>
            {cv.contact.city}{cv.contact.country && `, ${cv.contact.country}`}
          </Text>
          {cv.contact.linkedin_url && (
            <Text style={styles.contactLine}>{cv.contact.linkedin_url}</Text>
          )}
        </View>
      )}

      {/* Experience */}
      {cv.experiences && cv.experiences.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
          {cv.experiences.map((exp) => (
            <View key={exp.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{exp.title}</Text>
                <Text style={styles.itemDate}>
                  {new Date(exp.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
                  {' - '}
                  {exp.is_current ? 'Présent' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' }) : ''}
                </Text>
              </View>
              <Text style={styles.itemSubtitle}>{exp.company}</Text>
              {exp.description && (
                <Text style={styles.itemDescription}>{exp.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {cv.educations && cv.educations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formation</Text>
          {cv.educations.map((edu) => (
            <View key={edu.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{edu.degree}</Text>
                <Text style={styles.itemDate}>
                  {new Date(edu.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
                  {' - '}
                  {edu.is_current ? 'En cours' : edu.end_date ? new Date(edu.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' }) : ''}
                </Text>
              </View>
              <Text style={styles.itemSubtitle}>{edu.institution}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {cv.skills && cv.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences</Text>
          <Text style={styles.skillsText}>
            {cv.skills.map(skill => skill.name).join(' • ')}
          </Text>
        </View>
      )}
    </Page>
  </Document>
);
