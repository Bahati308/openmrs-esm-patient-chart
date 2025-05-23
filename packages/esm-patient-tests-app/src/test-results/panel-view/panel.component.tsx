import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Layer,
} from '@carbon/react';
import { getClass } from './helper';
import type { ObsRecord } from '../../types';
import { formatDate, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import styles from './result-panel.scss';

interface LabSetPanelProps {
  panel: ObsRecord;
  observations: Array<ObsRecord>;
  activePanel: ObsRecord;
  setActivePanel: React.Dispatch<React.SetStateAction<ObsRecord>>;
}

const LabSetPanel: React.FC<LabSetPanelProps> = ({ panel, observations, activePanel, setActivePanel }) => {
  const { t } = useTranslation();
  const date = new Date(panel.effectiveDateTime);
  const layout = useLayoutType();

  const hasRange = panel.meta?.range;

  const headers = useMemo(
    () =>
      hasRange
        ? [
            {
              id: 'testName',
              key: 'testName',
              header: t('testName', 'Test name'),
            },
            {
              id: 'value',
              key: 'value',
              header: t('value', 'Value'),
            },
            {
              id: 'range',
              key: 'range',
              header: t('referenceRange', 'Reference range'),
            },
          ]
        : [
            {
              id: 'testName',
              key: 'testName',
              header: t('testName', 'Test name'),
            },
            {
              id: 'value',
              key: 'value',
              header: t('value', 'Value'),
            },
          ],
    [t, hasRange],
  );

  const rowsData = useMemo(
    () =>
      hasRange
        ? observations.map((test) => ({
            id: test.id,
            testName: test.name,
            value: {
              content: <span>{`${test.value} ${test.meta?.units}`}</span>,
            },
            interpretation: test.interpretation,
            range: test.meta.range ? `${test.meta?.range} ${test.meta?.units}` : '--',
          }))
        : observations.map((test) => ({
            id: test.id,
            testName: test.name,
            value: {
              content: <span>{`${test.value} ${test.meta?.units ?? ''}`}</span>,
            },
            interpretation: test.interpretation,
          })),
    [observations, hasRange],
  );

  return (
    <Layer
      className={classNames(styles.labSetPanel, {
        [styles.activePanel]: activePanel?.conceptUuid === panel.conceptUuid,
      })}
    >
      <div onClick={() => setActivePanel(panel)} role="button" tabIndex={0}>
        <div className={styles.panelHeader}>
          <h2 className={styles.productiveHeading02}>{panel.name}</h2>
          <p className={styles.subtitleText}>
            {formatDate(date, {
              mode: 'wide',
              time: false,
            })}{' '}
            &bull; {`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`}
          </p>
        </div>
        <DataTable rows={rowsData} headers={headers}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <Table className={styles.table} {...getTableProps()} size={isDesktop(layout) ? 'sm' : 'md'}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, indx) => {
                    return (
                      <TableRow key={row.id} className={classNames(getClass(rowsData[indx]?.interpretation), 'check')}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell?.value?.content ?? cell.value}</TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </Layer>
  );
};

export default LabSetPanel;
