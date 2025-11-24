import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { CV } from '@/types/api.types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  summary: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
  contact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
    fontSize: 9,
    color: '#475569',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottom: '1 solid #cbd5e1',
    paddingBottom: 5,
  },
  item: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skill: {
    fontSize: 9,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4 8',
    borderRadius: 4,
  },
});

interface ModernTemplateProps {
  cv: CV;
}

export const ModernTemplate = ({ cv }: ModernTemplateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{cv.contact?.email.split('@')[0] || 'Nom'}</Text>
        <Text style={styles.title}>{cv.title}</Text>
        {cv.summary && <Text style={styles.summary}>{cv.summary}</Text>}
      </View>

      {/* Contact */}
      {cv.contact && (
        <View style={styles.contact}>
          <Text>{cv.contact.email}</Text>
          <Text>•</Text>
          <Text>{cv.contact.phone_number}</Text>
          <Text>•</Text>
          <Text>{cv.contact.city}{cv.contact.country && `, ${cv.contact.country}`}</Text>
          {cv.contact.linkedin_url && (
            <>
              <Text>•</Text>
              <Text>{cv.contact.linkedin_url}</Text>
            </>
          )}
        </View>
      )}

      {/* Skills */}
      {cv.skills && cv.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPÉTENCES</Text>
          <View style={styles.skillsContainer}>
            {cv.skills.map((skill) => (
              <Text key={skill.id} style={styles.skill}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Experience */}
      {cv.experiences && cv.experiences.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPÉRIENCE PROFESSIONNELLE</Text>
          {cv.experiences.map((exp) => (
            <View key={exp.id} style={styles.item}>
              <Text style={styles.itemTitle}>{exp.title}</Text>
              <Text style={styles.itemSubtitle}>{exp.company}</Text>
              <Text style={styles.itemDate}>
                {new Date(exp.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                {' - '}
                {exp.is_current ? 'Présent' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : ''}
              </Text>
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
          <Text style={styles.sectionTitle}>FORMATION</Text>
          {cv.educations.map((edu) => (
            <View key={edu.id} style={styles.item}>
              <Text style={styles.itemTitle}>{edu.degree}</Text>
              <Text style={styles.itemSubtitle}>{edu.institution}</Text>
              <Text style={styles.itemDate}>
                {new Date(edu.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                {' - '}
                {edu.is_current ? 'En cours' : edu.end_date ? new Date(edu.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);
