import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CV } from '@/types/api.types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  summary: {
    fontSize: 10,
    color: '#555555',
    lineHeight: 1.6,
  },
  contact: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
    fontSize: 9,
    color: '#666666',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  item: {
    marginBottom: 14,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  itemDate: {
    fontSize: 9,
    color: '#999999',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#555555',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.5,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skill: {
    fontSize: 10,
    color: '#333333',
  },
});

interface MinimalistTemplateProps {
  cv: CV;
}

export const MinimalistTemplate = ({ cv }: MinimalistTemplateProps) => (
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
          <Text>{cv.contact.phone_number}</Text>
          <Text>{cv.contact.city}{cv.contact.country && `, ${cv.contact.country}`}</Text>
        </View>
      )}

      {/* Experience */}
      {cv.experiences && cv.experiences.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {cv.experiences.map((exp) => (
            <View key={exp.id} style={styles.item}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemTitle}>{exp.title}</Text>
                <Text style={styles.itemDate}>
                  {new Date(exp.start_date).getFullYear()}
                  {' - '}
                  {exp.is_current ? 'Now' : exp.end_date ? new Date(exp.end_date).getFullYear() : ''}
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
          <Text style={styles.sectionTitle}>Education</Text>
          {cv.educations.map((edu) => (
            <View key={edu.id} style={styles.item}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemTitle}>{edu.degree}</Text>
                <Text style={styles.itemDate}>
                  {new Date(edu.start_date).getFullYear()}
                  {' - '}
                  {edu.is_current ? 'Now' : edu.end_date ? new Date(edu.end_date).getFullYear() : ''}
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
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsRow}>
            {cv.skills.map((skill, index) => (
              <Text key={skill.id} style={styles.skill}>
                {skill.name}{index < cv.skills!.length - 1 ? '  ·' : ''}
              </Text>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);
